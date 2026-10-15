const pdfParse = require('pdf-parse');
const logger = require('./logger');

/**
 * Clean and normalize text extracted from PDF
 */
function cleanText(text) {
  if (!text) return '';
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function parsePdf(buffer) {
  try {
    const pdfModule = require('pdf-parse');
    let text = '';
    let numPages = 1;

    if (pdfModule.PDFParse) {
      // pdf-parse v2+
      const parser = new pdfModule.PDFParse({ data: buffer });
      await parser.load();
      const result = await parser.getText();
      text = result.text || '';
      numPages = result.total || (result.pages ? result.pages.length : 1);
    } else if (typeof pdfModule === 'function') {
      // pdf-parse v1
      const data = await pdfModule(buffer);
      text = data.text || '';
      numPages = data.numpages || 1;
    } else {
      throw new Error('Unsupported pdf-parse library structure');
    }

    const cleaned = cleanText(text);
    return {
      text: cleaned,
      numPages: numPages || 1,
      info: {},
      version: '2.0'
    };
  } catch (err) {
    logger.error(`PDF parse error: ${err.message}`);
    throw new Error(`Failed to parse PDF document: ${err.message}`);
  }
}

/**
 * Split text into overlapping chunks for RAG retrieval
 * @param {string} text - Cleaned text
 * @param {number} chunkSize - Approximate characters per chunk (default 750)
 * @param {number} chunkOverlap - Overlap characters between chunks (default 150)
 */
function chunkText(text, chunkSize = 750, chunkOverlap = 150) {
  if (!text || text.length === 0) return [];

  // Split into paragraphs first to avoid awkward mid-word breaks
  const paragraphs = text.split(/\n\s*\n/);
  const chunks = [];
  let currentChunk = '';

  for (const para of paragraphs) {
    const cleanPara = para.trim();
    if (!cleanPara) continue;

    if (currentChunk.length + cleanPara.length <= chunkSize) {
      currentChunk += (currentChunk ? '\n\n' : '') + cleanPara;
    } else {
      // If current chunk has substantial content, push it
      if (currentChunk.length >= 200) {
        chunks.push(currentChunk.trim());
        // Start next chunk with overlap from the tail of current chunk
        const overlapStart = Math.max(0, currentChunk.length - chunkOverlap);
        const overlapSnippet = currentChunk.slice(overlapStart).trim();
        currentChunk = overlapSnippet ? overlapSnippet + '\n\n' + cleanPara : cleanPara;
      } else {
        // If single paragraph exceeds chunkSize, split it by sentences
        const sentences = cleanPara.split(/(?<=[.?!])\s+/);
        for (const sentence of sentences) {
          if (currentChunk.length + sentence.length <= chunkSize) {
            currentChunk += (currentChunk ? ' ' : '') + sentence;
          } else {
            if (currentChunk) chunks.push(currentChunk.trim());
            currentChunk = sentence;
          }
        }
      }
    }
  }

  if (currentChunk && currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks.map((content, idx) => ({
    chunkIndex: idx + 1,
    content,
    charLength: content.length
  }));
}

module.exports = {
  parsePdf,
  chunkText,
  cleanText
};
