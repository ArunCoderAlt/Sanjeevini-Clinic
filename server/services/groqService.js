const logger = require('../utils/logger');
const env = require('../config/environment');
const groqUsageTracker = require('./groqUsageTracker');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

/**
 * Generate a strict, grounded response using Groq LLM
 * @param {Object} options
 * @param {string} options.userMessage - Current question from patient
 * @param {Array} options.relevantChunks - Retrieved context chunks from PDF / knowledge base
 * @param {Array} options.conversationHistory - Multi-turn conversation messages
 */
async function generateBotReply({ userMessage, relevantChunks = [], conversationHistory = [] }) {
  const apiKey = env.groqApiKey || process.env.GROQ_API_KEY;
  const model = env.groqModel || process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

  // Format retrieved PDF context with relevance scores for transparency
  let contextBlock = '';
  if (relevantChunks && relevantChunks.length > 0) {
    contextBlock = relevantChunks
      .map((c, i) => {
        const docName = c.document_name || 'Clinic Guide';
        const section = c.section_title ? ` | SECTION: ${c.section_title}` : '';
        const relevance = c.score ? ` | RELEVANCE: ${c.score}` : '';
        return `--- [SOURCE #${i + 1}: ${docName}${section}${relevance}] ---\n${c.content}`;
      })
      .join('\n\n');
  } else {
    contextBlock = 'No specific document excerpts found for this query.';
  }

  const systemPrompt = `You are "Sanjeevini AI", the official healthcare assistant for Sanjeevini Siddha & Ayurveda Medical Centre located in Karaikal, Puducherry.
Your purpose is to assist patients one-on-one by answering their queries, explaining our therapies, and clearing doubts in a warm, conversational, and highly helpful manner.

BILINGUAL MANDATE (TAMIL & ENGLISH):
1. AUTOMATIC LANGUAGE DETECTION:
   - If the user asks in TAMIL (தமிழ் script or Tanglish/transliterated Tamil like "timing enna?", "maruthuvamanai enga irukku?"), you MUST respond in polite, natural, grammatical TAMIL (தமிழ்).
   - If the user asks in ENGLISH, you MUST respond in professional, empathetic ENGLISH.
   - If the user switches language at any point, immediately switch and reply in their chosen language.
2. CROSS-LINGUAL SYNTHESIS:
   - The clinic knowledge base below contains excerpts from clinic guide documents and uploaded medical PDFs, which may be in English, Tamil, or both.
   - If the user asks in Tamil and the knowledge excerpts are in English, accurately translate and explain the clinic facts into natural Tamil so the patient understands completely.
   - If the user asks in English and the knowledge excerpts are in Tamil, translate and answer in English.
   - Keep classical Siddha and Ayurvedic terms clear and authentic (e.g., வர்மம் / Varmam, தொக்கணாம் / Thokkanam, நாடி பரிசோதனை / Nadi Parikshai, வாதம், பித்தம், கபம்).

STRICT GROUNDING & ACCURACY:
3. STRICTLY ACCURATE: You must answer questions ONLY using the information provided in the "CLINIC KNOWLEDGE BASE" section below. Synthesize information from MULTIPLE source chunks when relevant — do not just quote a single excerpt.
4. DO NOT HALLUCINATE: Never invent facts, procedures, prices, consultation timings, or doctors not explicitly mentioned in the knowledge base.
5. CLINIC TIMINGS & LOCATION:
   - English: Monday to Saturday, 5:00 PM to 9:30 PM (Sunday closed). Address: No. 22, Dr. Ambedkar Street, Karaikal - 609602.
   - Tamil: திங்கள் முதல் சனி வரை, மாலை 5:00 மணி முதல் இரவு 9:30 மணி வரை (ஞாயிறு விடுமுறை). முகவரி: எண் 22, டாக்டர் அம்பேத்கர் வீதி, காரைக்கால் - 609602.
6. UNANSWERABLE QUERIES:
   - In English: "I cannot find this specific information in our current clinic guide. For accurate guidance, please speak with our clinic doctors directly at +91 98430 66362 or message us on WhatsApp, or visit us in person at No. 22, Dr. Ambedkar Street, Karaikal."
   - In Tamil: "எங்கள் தற்போதைய மருத்துவமனை வழிகாட்டியில் இந்த குறிப்பிட்ட தகவல் கிடைக்கவில்லை. துல்லியமான மருத்துவ ஆலோசனைக்கு, தயவுசெய்து எங்கள் மருத்துவர்களை நேரடியாக +91 98430 66362 என்ற எண்ணில் அழைக்கவும் அல்லது வாட்ஸ்அப்பில் தொடர்பு கொள்ளவும், அல்லது எண் 22, டாக்டர் அம்பேத்கர் வீதி, காரைக்கால் முகவரியில் நேரில் வரவும்."
7. TONE & FORMAT: Warm, compassionate, concise, and respectful. Use **bold** for key points and bullet points for lists. Keep paragraphs readable on mobile screens.
8. GREETINGS: For greetings like "hi", "hello", "namaste", "வணக்கம்", greet warmly and invite the user to ask their question in Tamil or English.

=== CLINIC KNOWLEDGE BASE (FROM UPLOADED DOCUMENTS) ===
${contextBlock}
=== END OF KNOWLEDGE BASE ===`;

  // If no Groq API Key is configured yet, provide resilient fallback using top matched knowledge
  if (!apiKey || apiKey.trim() === '' || apiKey.startsWith('gsk_your_groq_api_key')) {
    logger.warn('GROQ_API_KEY is not configured in server/.env. Using knowledge-base direct answer fallback.');
    return generateFallbackAnswer(userMessage, relevantChunks);
  }

  try {
    // Sanitize and limit conversation history to last 10 messages for better multi-turn context
    const recentHistory = Array.isArray(conversationHistory)
      ? conversationHistory.slice(-10).map(m => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: String(m.content || '').slice(0, 1500)
        }))
      : [];

    // Remove the last user message from history if it duplicates the current message
    // (frontend sends current message as part of history too)
    const filteredHistory = recentHistory.filter((m, idx) => {
      if (idx === recentHistory.length - 1 && m.role === 'user' && m.content.trim() === userMessage.trim()) {
        return false;
      }
      return true;
    });

    const messages = [
      { role: 'system', content: systemPrompt },
      ...filteredHistory,
      { role: 'user', content: userMessage }
    ];

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.trim()}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.3,
        max_tokens: 1200,
        top_p: 0.95
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`Groq API error (${response.status}): ${errorText}`);

      // Track failed / rate-limited request
      await groqUsageTracker.recordUsage({
        apiKey,
        model,
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        status: response.status === 429 ? 'rate_limited' : 'error',
        httpStatus: response.status,
        usageSource: 'bot_chat',
        headers: response.headers
      });

      throw new Error(`Groq API returned HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    let replyText = data?.choices?.[0]?.message?.content?.trim();
    if (!replyText && data?.choices?.[0]?.message?.reasoning) {
      replyText = data.choices[0].message.reasoning.trim();
    }

    // Strip any <think>...</think> reasoning blocks from models that include them
    if (replyText) {
      replyText = replyText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
    }

    if (!replyText) {
      throw new Error('Empty response received from Groq LLM.');
    }

    // Record verified token usage and rate limits
    await groqUsageTracker.recordUsage({
      apiKey,
      model,
      inputTokens: data?.usage?.prompt_tokens || 0,
      outputTokens: data?.usage?.completion_tokens || 0,
      totalTokens: data?.usage?.total_tokens || 0,
      status: 'success',
      httpStatus: response.status,
      usageSource: 'bot_chat',
      headers: response.headers
    });

    // Deduplicate sources by document name
    const seenSources = new Set();
    const uniqueSources = [];
    for (const c of relevantChunks) {
      const key = `${c.document_name || 'Clinic Guide'}|${c.section_title || ''}`;
      if (!seenSources.has(key)) {
        seenSources.add(key);
        uniqueSources.push({
          document: c.document_name || 'Clinic Guide',
          section: c.section_title || `Chunk #${c.chunk_index}`
        });
      }
    }

    return {
      reply: replyText,
      modelUsed: model,
      sourceCount: relevantChunks.length,
      sources: uniqueSources
    };
  } catch (err) {
    logger.error(`Error in generateBotReply with Groq: ${err.message}`);
    // Fallback to grounded excerpt answer rather than crashing
    return generateFallbackAnswer(userMessage, relevantChunks, err.message);
  }
}

/**
 * Fallback answer when Groq key is not configured or network error occurs
 * Supports both Tamil and English queries seamlessly
 */
function generateFallbackAnswer(query, relevantChunks, apiError = null) {
  // Check if query is in Tamil script or Tamil keywords
  const isTamil = /[\u0B80-\u0BFF]/.test(query) || 
    /\b(vanakkam|siddha|ayurveda|maruthuvam|varmam|timing enna|doctor yaaru)\b/i.test(query);

  if (!relevantChunks || relevantChunks.length === 0) {
    if (isTamil) {
      return {
        reply: `வணக்கம்! 🙏 சஞ்சீவினி சித்த & ஆயுர்வேத மருத்துவ மையத்திற்கு தங்களை அன்புடன் வரவேற்கிறோம்.\n\nஎங்கள் மருத்துவமனை திங்கள் முதல் சனி வரை மாலை 5:00 மணி முதல் இரவு 9:30 மணி வரை செயல்படுகிறது (முகவரி: எண் 22, டாக்டர் அம்பேத்கர் வீதி, காரைக்கால் - 609602).\n\nசிகிச்சைகள் மற்றும் முன்பதிவுக்கு எங்களை +91 98430 66362 என்ற எண்ணில் நேரடியாக அழைக்கலாம் அல்லது வாட்ஸ்அப்பில் தொடர்பு கொள்ளலாம்.`,
        modelUsed: 'local-knowledge-fallback',
        sources: []
      };
    }

    return {
      reply: `Namaste! Welcome to Sanjeevini Siddha & Ayurveda Medical Centre.\n\nOur clinic is open Monday to Saturday from 5:00 PM to 9:30 PM at No. 22, Dr. Ambedkar Street, Karaikal.\n\nFor any specific questions or treatments, please call us at +91 98430 66362 or message us on WhatsApp.`,
      modelUsed: 'local-knowledge-fallback',
      sources: []
    };
  }

  // Use up to 3 top chunks to construct a comprehensive response
  const topChunks = relevantChunks.slice(0, 3);
  const combinedContent = topChunks
    .map(c => c.content.replace(/^\[.*?\]\n/, '').trim())
    .join('\n\n');

  // Truncate if too long (keep under 2000 chars for readability)
  const displayContent = combinedContent.length > 2000 
    ? combinedContent.slice(0, 2000) + '...' 
    : combinedContent;

  const adminNotice = apiError 
    ? `\n\n*(Note: Groq LLM connection notice: ${apiError})*`
    : `\n\n*(Admin Tip: Add your GROQ_API_KEY in server/.env for enhanced conversational intelligence)*`;

  // Deduplicate sources
  const seenSources = new Set();
  const uniqueSources = [];
  for (const c of relevantChunks) {
    const key = `${c.document_name || 'Clinic Guide'}|${c.section_title || ''}`;
    if (!seenSources.has(key)) {
      seenSources.add(key);
      uniqueSources.push({
        document: c.document_name || 'Clinic Guide',
        section: c.section_title || `Chunk #${c.chunk_index}`
      });
    }
  }

  if (isTamil) {
    return {
      reply: `வணக்கம்! எங்கள் மருத்துவமனை ஆவணங்களின்படி:\n\n${displayContent}\n\nமேலும் விவரங்களுக்கு மருத்துவர்களை +91 98430 66362 என்ற எண்ணில் நேரடியாக அழைக்கலாம் அல்லது திங்கள் - சனி (மாலை 5:00 – இரவு 9:30) நேரில் சந்திக்கலாம்.${adminNotice}`,
      modelUsed: 'local-knowledge-fallback',
      sourceCount: relevantChunks.length,
      sources: uniqueSources
    };
  }

  return {
    reply: `Namaste! Based on our clinic's documentation:\n\n${displayContent}\n\nFor more details or to consult our doctors, you can call us directly at +91 98430 66362 or visit us Monday to Saturday (5:00 PM – 9:30 PM).${adminNotice}`,
    modelUsed: 'local-knowledge-fallback',
    sourceCount: relevantChunks.length,
    sources: uniqueSources
  };
}

/**
 * Test Groq API connection with a simple ping and track token usage
 */
async function testGroqConnection() {
  const apiKey = env.groqApiKey || process.env.GROQ_API_KEY;
  const model = env.groqModel || process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

  if (!apiKey || apiKey.trim() === '' || apiKey.startsWith('gsk_your_groq_api_key')) {
    return {
      connected: false,
      message: 'GROQ_API_KEY is not set in server/.env',
      model
    };
  }

  try {
    const res = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.trim()}`
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: 'Ping. Respond with "Pong".' }],
        max_tokens: 60
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      await groqUsageTracker.recordUsage({
        apiKey,
        model,
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        status: res.status === 429 ? 'rate_limited' : 'error',
        httpStatus: res.status,
        usageSource: 'test_ping',
        headers: res.headers
      });

      return {
        connected: false,
        message: `Groq error HTTP ${res.status}: ${errText}`,
        model
      };
    }

    const data = await res.json();
    await groqUsageTracker.recordUsage({
      apiKey,
      model,
      inputTokens: data?.usage?.prompt_tokens || 0,
      outputTokens: data?.usage?.completion_tokens || 0,
      totalTokens: data?.usage?.total_tokens || 0,
      status: 'success',
      httpStatus: res.status,
      usageSource: 'test_ping',
      headers: res.headers
    });

    return {
      connected: true,
      message: 'Groq API connection verified successfully!',
      model,
      sampleResponse: data?.choices?.[0]?.message?.content,
      usage: data?.usage
    };
  } catch (err) {
    return {
      connected: false,
      message: `Failed to connect to Groq: ${err.message}`,
      model
    };
  }
}

/**
 * Update and persist Groq API Key and Model, transitioning tracking period
 */
function updateGroqConfig({ apiKey, model }) {
  const fs = require('fs');
  const path = require('path');

  let keyChanged = false;

  if (apiKey !== undefined) {
    const trimmed = String(apiKey).trim();
    if (env.groqApiKey !== trimmed) {
      keyChanged = true;
    }
    env.groqApiKey = trimmed;
    process.env.GROQ_API_KEY = trimmed;
  }
  if (model) {
    env.groqModel = model;
    process.env.GROQ_MODEL = model;
  }

  // Trigger tracker key period transition if key changed
  if (keyChanged) {
    groqUsageTracker.onApiKeyChanged(env.groqApiKey).catch(err => {
      logger.warn(`[GroqUsageTracker] Error transitioning key period: ${err.message}`);
    });
  }

  // Persist to server/.env
  try {
    const envPath = path.join(__dirname, '../.env');
    if (fs.existsSync(envPath)) {
      let content = fs.readFileSync(envPath, 'utf8');

      if (apiKey !== undefined) {
        if (/GROQ_API_KEY=.*/.test(content)) {
          content = content.replace(/GROQ_API_KEY=.*/, `GROQ_API_KEY=${env.groqApiKey}`);
        } else {
          content += `\nGROQ_API_KEY=${env.groqApiKey}`;
        }
      }

      if (model) {
        if (/GROQ_MODEL=.*/.test(content)) {
          content = content.replace(/GROQ_MODEL=.*/, `GROQ_MODEL=${env.groqModel}`);
        } else {
          content += `\nGROQ_MODEL=${env.groqModel}`;
        }
      }

      fs.writeFileSync(envPath, content, 'utf8');
      logger.info('Updated Groq credentials in server/.env');
    }
  } catch (err) {
    logger.warn(`Could not persist GROQ_API_KEY to .env: ${err.message}`);
  }

  return {
    groqApiKeyConfigured: Boolean(env.groqApiKey && env.groqApiKey.length > 5),
    groqModel: env.groqModel
  };
}

module.exports = {
  generateBotReply,
  generateFallbackAnswer,
  testGroqConnection,
  updateGroqConfig
};
