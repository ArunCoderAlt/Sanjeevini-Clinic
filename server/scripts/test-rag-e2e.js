/**
 * End-to-end RAG pipeline diagnostic test
 * Tests: Supabase connectivity → Table schema → Document insert → Chunk insert → 
 *        Search retrieval → Groq API call → Response quality
 * 
 * Run: cd server && node scripts/test-rag-e2e.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { createClient } = require('@supabase/supabase-js');
const env = require('../config/environment');
const logger = require('../utils/logger');

const SUPABASE_URL = env.supabaseUrl;
const SUPABASE_KEY = env.supabaseKey;
const GROQ_API_KEY = env.groqApiKey || process.env.GROQ_API_KEY;
const GROQ_MODEL = env.groqModel || process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

let supabase;
const results = [];

function log(label, status, detail) {
  const icon = status === 'PASS' ? '✅' : status === 'WARN' ? '⚠️' : '❌';
  console.log(`${icon} [${label}] ${detail}`);
  results.push({ label, status, detail });
}

async function main() {
  console.log('\n══════════════════════════════════════════════════════');
  console.log('  SANJEEVINI RAG CHATBOT — END-TO-END DIAGNOSTIC');
  console.log('══════════════════════════════════════════════════════\n');

  // ─── 1. Check env vars ───
  console.log('── 1. ENVIRONMENT VARIABLES ──');
  if (!SUPABASE_URL) { log('SUPABASE_URL', 'FAIL', 'Missing'); return; }
  log('SUPABASE_URL', 'PASS', SUPABASE_URL);
  log('SUPABASE_KEY', SUPABASE_KEY ? 'PASS' : 'FAIL', SUPABASE_KEY ? `Set (${SUPABASE_KEY.slice(0, 20)}…)` : 'Missing');
  log('GROQ_API_KEY', GROQ_API_KEY ? 'PASS' : 'FAIL', GROQ_API_KEY ? `Set (${GROQ_API_KEY.slice(0, 15)}…)` : 'Missing — chatbot will use fallback');
  log('GROQ_MODEL', 'PASS', GROQ_MODEL);
  console.log('');

  // ─── 2. Supabase connectivity ───
  console.log('── 2. SUPABASE CONNECTIVITY ──');
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    const { data, error } = await supabase.from('rag_documents').select('id').limit(1);
    if (error) {
      log('Supabase rag_documents', 'FAIL', error.message);
      
      // Try bot_documents fallback
      const { error: botErr } = await supabase.from('bot_documents').select('id').limit(1);
      if (botErr) {
        log('Supabase bot_documents', 'FAIL', botErr.message);
        log('TABLE STATUS', 'FAIL', 'Neither rag_documents nor bot_documents exists. Run supabase_rag_schema.sql first.');
      } else {
        log('Supabase bot_documents', 'PASS', 'Fallback table accessible');
      }
    } else {
      log('Supabase rag_documents', 'PASS', 'Table accessible');
    }
  } catch (err) {
    log('Supabase connection', 'FAIL', err.message);
  }
  console.log('');

  // ─── 3. Schema column validation ───
  console.log('── 3. TABLE SCHEMA VALIDATION ──');
  try {
    const { randomUUID } = require('crypto');
    const testDocId = randomUUID();
    const testPayload = {
      id: testDocId,
      filename: '__test_diagnostic__.pdf',
      original_name: 'Diagnostic Test',
      file_url: '',
      storage_path: 'test://diagnostic',
      storage_bucket: 'rag-documents',
      file_size: 0,
      page_count: 1,
      chunk_count: 0,
      is_active: false,
      metadata: { test: true },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { error: insertErr } = await supabase.from('rag_documents').insert([testPayload]);
    if (insertErr) {
      const colMatch = insertErr.message.match(/Could not find the '([^']+)' column/);
      if (colMatch) {
        log('rag_documents schema', 'FAIL', `Column "${colMatch[1]}" doesn't exist. The table schema is outdated or mismatched.`);
      } else {
        log('rag_documents schema', 'FAIL', insertErr.message);
      }
    } else {
      log('rag_documents schema', 'PASS', 'All columns match');
      // Clean up test row
      await supabase.from('rag_documents').delete().eq('id', testDocId);
    }

    // Test rag_chunks schema
    const testChunkId = randomUUID();
    const testChunkPayload = {
      id: testChunkId,
      document_id: testDocId,
      chunk_index: 1,
      content: 'test chunk',
      page_number: 1,
      section_title: 'test',
      metadata: {},
      created_at: new Date().toISOString()
    };

    // Insert the doc first temporarily for FK constraint
    await supabase.from('rag_documents').insert([testPayload]);
    const { error: chunkErr } = await supabase.from('rag_chunks').insert([testChunkPayload]);
    if (chunkErr) {
      const colMatch = chunkErr.message.match(/Could not find the '([^']+)' column/);
      if (colMatch) {
        log('rag_chunks schema', 'FAIL', `Column "${colMatch[1]}" doesn't exist.`);
      } else {
        log('rag_chunks schema', 'FAIL', chunkErr.message);
      }
    } else {
      log('rag_chunks schema', 'PASS', 'All columns match');
      await supabase.from('rag_chunks').delete().eq('id', testChunkId);
    }
    // Clean up
    await supabase.from('rag_documents').delete().eq('id', testDocId);
  } catch (err) {
    log('Schema validation', 'FAIL', err.message);
  }
  console.log('');

  // ─── 4. Check existing documents & chunks ───
  console.log('── 4. EXISTING DOCUMENTS & CHUNKS ──');
  try {
    const { data: docs, error: docErr } = await supabase
      .from('rag_documents')
      .select('id, original_name, chunk_count, is_active, created_at')
      .order('created_at', { ascending: false });

    if (docErr) {
      log('Documents query', 'FAIL', docErr.message);
    } else {
      log('Documents in DB', docs.length > 0 ? 'PASS' : 'WARN', `${docs.length} document(s) found`);
      for (const d of docs) {
        console.log(`   📄 "${d.original_name}" — ${d.chunk_count} chunks — active: ${d.is_active} — ${d.created_at}`);
      }
    }

    const { data: chunks, error: chunkErr } = await supabase
      .from('rag_chunks')
      .select('id', { count: 'exact', head: true });

    const chunkCount = chunks ? chunks.length : 0;
    // Use count from header if available
    const { count } = await supabase.from('rag_chunks').select('id', { count: 'exact', head: true });
    log('Chunks in DB', count > 0 ? 'PASS' : 'WARN', `${count || 0} total chunk(s)`);
  } catch (err) {
    log('Documents check', 'FAIL', err.message);
  }
  console.log('');

  // ─── 5. Check Supabase Storage bucket ───
  console.log('── 5. SUPABASE STORAGE BUCKET ──');
  try {
    const { data: files, error: listErr } = await supabase.storage
      .from('rag-documents')
      .list('pdfs', { limit: 20, sortBy: { column: 'created_at', order: 'desc' } });

    if (listErr) {
      log('Storage bucket', 'FAIL', listErr.message);
    } else {
      const pdfFiles = (files || []).filter(f => f.name && f.name.toLowerCase().endsWith('.pdf'));
      log('Storage bucket', pdfFiles.length > 0 ? 'PASS' : 'WARN', `${pdfFiles.length} PDF file(s) in rag-documents/pdfs/`);
      for (const f of pdfFiles.slice(0, 5)) {
        console.log(`   📁 ${f.name} — ${f.metadata?.size ? (f.metadata.size / 1024).toFixed(1) + ' KB' : 'unknown size'}`);
      }
    }
  } catch (err) {
    log('Storage check', 'FAIL', err.message);
  }
  console.log('');

  // ─── 6. Test BotKnowledgeService runtime ───
  console.log('── 6. KNOWLEDGE SERVICE RUNTIME ──');
  try {
    const botKnowledgeService = require('../services/botKnowledgeService');
    
    // Wait for async init to complete
    await new Promise(resolve => setTimeout(resolve, 3000));

    const allDocs = await botKnowledgeService.getDocuments();
    const activeDocs = allDocs.filter(d => d.is_active);
    log('Runtime documents', allDocs.length > 0 ? 'PASS' : 'FAIL', `${allDocs.length} total, ${activeDocs.length} active`);

    const status = botKnowledgeService.getStatus();
    log('Runtime chunks', status.activeChunks > 0 ? 'PASS' : 'FAIL', `${status.activeChunks} active chunks in memory`);
    log('Seed knowledge', status.hasSeedKnowledge ? 'PASS' : 'WARN', status.hasSeedKnowledge ? 'Present' : 'Missing');

    // Test search
    const testQueries = [
      'What are your clinic timings?',
      'Where is your hospital located?',
      'What treatments do you offer?',
      'வர்மம் சிகிச்சை என்ன?'
    ];

    console.log('');
    console.log('── 7. SEARCH RETRIEVAL TESTS ──');
    for (const q of testQueries) {
      const results = botKnowledgeService.searchRelevantChunks(q, 4);
      const hasResults = results.length > 0;
      const topScore = hasResults ? results[0].score : 0;
      const docNames = [...new Set(results.map(r => r.document_name || 'unknown'))].join(', ');
      log(`Search: "${q.slice(0, 50)}"`, hasResults ? 'PASS' : 'WARN', 
        `${results.length} chunks (top score: ${topScore}, docs: ${docNames})`);
      
      if (hasResults) {
        console.log(`   📝 Top chunk preview: "${results[0].content.slice(0, 120).replace(/\n/g, ' ')}…"`);
      }
    }
    console.log('');

    // ─── 8. Groq API test ───
    console.log('── 8. GROQ LLM API TEST ──');
    if (!GROQ_API_KEY || GROQ_API_KEY.startsWith('gsk_your_groq_api_key')) {
      log('Groq API', 'FAIL', 'GROQ_API_KEY not configured — chatbot uses fallback answers only');
    } else {
      try {
        const { testGroqConnection } = require('../services/groqService');
        const groqResult = await testGroqConnection();
        log('Groq API ping', groqResult.connected ? 'PASS' : 'FAIL', groqResult.message);
        if (groqResult.connected) {
          log('Groq model', 'PASS', `${groqResult.model} — response: "${groqResult.sampleResponse}"`);
        }
      } catch (err) {
        log('Groq API', 'FAIL', err.message);
      }
    }
    console.log('');

    // ─── 9. Full chat pipeline test ───
    console.log('── 9. FULL CHAT PIPELINE TEST ──');
    try {
      const { generateBotReply } = require('../services/groqService');
      
      const testQuestion = 'Where is your hospital located?';
      const chunks = botKnowledgeService.searchRelevantChunks(testQuestion, 8);
      
      console.log(`   Query: "${testQuestion}"`);
      console.log(`   Retrieved chunks: ${chunks.length}`);
      
      const reply = await generateBotReply({
        userMessage: testQuestion,
        relevantChunks: chunks,
        conversationHistory: []
      });

      log('Chat pipeline', 'PASS', `Model: ${reply.modelUsed}`);
      console.log(`   📨 Response preview: "${reply.reply.slice(0, 200).replace(/\n/g, ' ')}…"`);
      console.log(`   📚 Sources: ${reply.sources?.length || 0}`);
      
      if (reply.modelUsed === 'local-knowledge-fallback') {
        log('LLM grounding', 'WARN', 'Using fallback — Groq API may be down or key invalid. Chatbot still works but with simpler answers.');
      } else {
        log('LLM grounding', 'PASS', `Groq ${reply.modelUsed} generated a grounded response`);
      }
    } catch (err) {
      log('Chat pipeline', 'FAIL', err.message);
    }

  } catch (err) {
    log('Knowledge service', 'FAIL', err.message);
  }

  // ─── Summary ───
  console.log('\n══════════════════════════════════════════════════════');
  console.log('  DIAGNOSTIC SUMMARY');
  console.log('══════════════════════════════════════════════════════');
  const fails = results.filter(r => r.status === 'FAIL');
  const warns = results.filter(r => r.status === 'WARN');
  const passes = results.filter(r => r.status === 'PASS');
  console.log(`✅ ${passes.length} passed  ⚠️ ${warns.length} warnings  ❌ ${fails.length} failures`);
  
  if (fails.length > 0) {
    console.log('\nCRITICAL ISSUES:');
    for (const f of fails) {
      console.log(`  ❌ ${f.label}: ${f.detail}`);
    }
  }
  if (warns.length > 0) {
    console.log('\nWARNINGS:');
    for (const w of warns) {
      console.log(`  ⚠️ ${w.label}: ${w.detail}`);
    }
  }
  console.log('');

  process.exit(fails.length > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('Diagnostic script crashed:', err);
  process.exit(2);
});
