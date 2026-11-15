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
 * Detect if a line looks like a section heading in English or Tamil
 * (short, likely capitalized or title-case, no trailing period)
 */
function detectSectionTitle(text) {
  if (!text) return '';
  const trimmed = text.trim();
  // Heading heuristics: short line, doesn't end with period, often capitalized or title-like
  if (trimmed.length > 0 && trimmed.length <= 120 && !trimmed.endsWith('.') && !trimmed.endsWith(',')) {
    // English heading checks: starts with number, bullet, or capital letters
    const isEnglishHeading = /^(?:\d+[\.\)]\s*|[A-Z•●■▪►-]\s*)/.test(trimmed) ||
                            (trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed) && trimmed.length > 2) ||
                            /^[A-Z][a-zA-Z\s&,\-:]+$/.test(trimmed);
    // Tamil heading check: contains Tamil characters, line under 90 chars without question mark
    const isTamilHeading = /[\u0B80-\u0BFF]/.test(trimmed) && trimmed.length <= 90 && !trimmed.includes('?');
    if (isEnglishHeading || isTamilHeading) return trimmed;
  }
  return '';
}

/**
 * Split text into overlapping chunks for RAG retrieval
 * Extracts section titles from detected headings for better search scoring
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
  let currentSectionTitle = '';

  for (const para of paragraphs) {
    const cleanPara = para.trim();
    if (!cleanPara) continue;

    // Check if this paragraph is a section heading
    const detectedTitle = detectSectionTitle(cleanPara);
    if (detectedTitle) {
      currentSectionTitle = detectedTitle;
    }

    if (currentChunk.length + cleanPara.length <= chunkSize) {
      currentChunk += (currentChunk ? '\n\n' : '') + cleanPara;
    } else {
      // If current chunk has substantial content, push it
      if (currentChunk.length >= 200) {
        chunks.push({ text: currentChunk.trim(), sectionTitle: currentSectionTitle });
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
            if (currentChunk) chunks.push({ text: currentChunk.trim(), sectionTitle: currentSectionTitle });
            currentChunk = sentence;
          }
        }
      }
    }
  }

  if (currentChunk && currentChunk.trim().length > 0) {
    chunks.push({ text: currentChunk.trim(), sectionTitle: currentSectionTitle });
  }

  return chunks.map((chunk, idx) => ({
    chunkIndex: idx + 1,
    content: chunk.text,
    sectionTitle: chunk.sectionTitle || '',
    charLength: chunk.text.length
  }));
}

module.exports = {
  parsePdf,
  chunkText,
  cleanText
};
