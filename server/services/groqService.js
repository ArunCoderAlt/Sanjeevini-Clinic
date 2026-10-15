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
  const model = env.groqModel || process.env.GROQ_MODEL || 'qwen/qwen3.8-27b';

  // Format retrieved PDF context
  let contextBlock = '';
  if (relevantChunks && relevantChunks.length > 0) {
    contextBlock = relevantChunks
      .map((c, i) => `--- [SOURCE DOCUMENT: ${c.document_name || 'Clinic Guide'} | CHUNK #${c.chunk_index || i + 1}] ---\n${c.content}`)
      .join('\n\n');
  } else {
    contextBlock = 'No specific document excerpts found for this query.';
  }

  const systemPrompt = `You are "Sanjeevini AI", the official healthcare assistant for Sanjeevini Siddha & Ayurveda Medical Centre located in Karaikal, Puducherry.
Your purpose is to assist patients one-on-one by answering their queries, explaining our therapies, and clearing doubts.

STRICT GROUNDING & ACCURACY MANDATE:
1. STRICTLY ACCURATE: You must answer questions ONLY using the information provided in the "CLINIC KNOWLEDGE BASE" section below.
2. DO NOT HALLUCINATE: Never invent facts, procedures, consultation prices, timings, or doctors not explicitly mentioned in the knowledge base.
3. CLINIC TIMINGS: Clinic hours are strictly Monday to Saturday, 5:00 PM to 9:30 PM (Sunday is closed).
4. UNANSWERABLE QUERIES: If the question cannot be answered from the provided knowledge base, reply politely:
   "I cannot find this specific information in our current clinic guide. For accurate guidance, please speak with our clinic doctors directly at +91 94431 89498 or message us on WhatsApp, or visit us in person at No. 22, Dr. Ambedkar Street, Karaikal."
5. TONE: Warm, compassionate, concise, and respectful. Use bullet points where appropriate for easy reading on mobile devices.

=== CLINIC KNOWLEDGE BASE (FROM UPLOADED DOCUMENTS) ===
${contextBlock}
=== END OF KNOWLEDGE BASE ===`;

  // If no Groq API Key is configured yet, provide resilient fallback using top matched knowledge
  if (!apiKey || apiKey.trim() === '' || apiKey.startsWith('gsk_your_groq_api_key')) {
    logger.warn('GROQ_API_KEY is not configured in server/.env. Using knowledge-base direct answer fallback.');
    return generateFallbackAnswer(userMessage, relevantChunks);
  }

  try {
    // Sanitize and limit conversation history to last 6 messages
    const recentHistory = Array.isArray(conversationHistory)
      ? conversationHistory.slice(-6).map(m => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: String(m.content || '').slice(0, 1000)
        }))
      : [];

    const messages = [
      { role: 'system', content: systemPrompt },
      ...recentHistory,
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
        temperature: 0.2, // Low temperature for high precision and adherence to PDF
        max_tokens: 800,
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

    return {
      reply: replyText,
      modelUsed: model,
      sourceCount: relevantChunks.length,
      sources: relevantChunks.map(c => ({
        document: c.document_name || 'Clinic Guide',
        section: c.section_title || `Chunk #${c.chunk_index}`
      }))
    };
  } catch (err) {
    logger.error(`Error in generateBotReply with Groq: ${err.message}`);
    // Fallback to grounded excerpt answer rather than crashing
    return generateFallbackAnswer(userMessage, relevantChunks, err.message);
  }
}

/**
 * Fallback answer when Groq key is not configured or network error occurs
 */
function generateFallbackAnswer(query, relevantChunks, apiError = null) {
  if (!relevantChunks || relevantChunks.length === 0) {
    return {
      reply: `Namaste! Welcome to Sanjeevini Siddha & Ayurveda Medical Centre.\n\nOur clinic is open Monday to Saturday from 5:00 PM to 9:30 PM at No. 22, Dr. Ambedkar Street, Karaikal.\n\nFor any specific questions or treatments, please call us at +91 94431 89498 or message us on WhatsApp.`,
      modelUsed: 'local-knowledge-fallback',
      sources: []
    };
  }

  // Use top chunk to construct a helpful response
  const topChunk = relevantChunks[0];
  const adminNotice = apiError 
    ? `\n\n*(Note: Groq LLM connection notice: ${apiError})*`
    : `\n\n*(Admin Tip: Add your GROQ_API_KEY in server/.env for enhanced conversational intelligence)*`;

  return {
    reply: `Namaste! Based on our clinic's documentation:\n\n${topChunk.content.replace(/^\[.*?\]\n/, '')}\n\nFor more details or to consult our doctors, you can call us directly at +91 94431 89498 or visit us Monday to Saturday (5:00 PM – 9:30 PM).${adminNotice}`,
    modelUsed: 'local-knowledge-fallback',
    sourceCount: relevantChunks.length,
    sources: relevantChunks.map(c => ({
      document: c.document_name || 'Clinic Guide',
      section: c.section_title || `Chunk #${c.chunk_index}`
    }))
  };
}

/**
 * Test Groq API connection with a simple ping and track token usage
 */
async function testGroqConnection() {
  const apiKey = env.groqApiKey || process.env.GROQ_API_KEY;
  const model = env.groqModel || process.env.GROQ_MODEL || 'qwen/qwen3.8-27b';

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
  testGroqConnection,
  updateGroqConfig
};
