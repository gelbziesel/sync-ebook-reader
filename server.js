// server.js - Optimized with compression and caching
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const AdmZip = require('adm-zip');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const chokidar = require('chokidar');
const compression = require('compression'); // ✅ ADD: npm install compression
const config = require('./config');

const app = express();

// ============================================
// CONSTANTS
// ============================================
const PORT = 3333;
const BODY_SIZE_LIMIT = '50mb';
const BATCH_SIZE = 500;

const SUPPORTED_AUDIO = ['.m4b', '.m4a', '.mp3'];
const SUPPORTED_IMAGE = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

const MIME_TYPES = {
  audio: {
    '.m4b': 'audio/mp4',
    '.m4a': 'audio/mp4',
    '.mp3': 'audio/mpeg'
  },
  image: {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp'
  }
};

// ============================================
// EXPRESS SETUP with COMPRESSION
// ============================================
// ✅ MAJOR PERFORMANCE: Enable gzip compression
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  },
  level: 6 // Balance between speed and compression
}));

app.use(express.json({ limit: BODY_SIZE_LIMIT }));

// ✅ PERFORMANCE: Add caching headers for static assets
app.use(express.static('public', {
  maxAge: '1d', // Cache static files for 1 day
  etag: true,
  lastModified: true
}));

let db;

// ============================================
// UTILITY FUNCTIONS
// ============================================

function errorResponse(res, message, statusCode = 500) {
  console.error(message);
  res.status(statusCode).json({ 
    error: message,
    timestamp: new Date().toISOString()
  });
}

async function getLibraryPath() {
  return await config.getLibraryPath();
}

async function withTransaction(callback) {
  try {
    await db.run('BEGIN TRANSACTION');
    await callback();
    await db.run('COMMIT');
  } catch (err) {
    await db.run('ROLLBACK');
    throw err;
  }
}

function isSupportedAudio(filename) {
  const ext = path.extname(filename).toLowerCase();
  return SUPPORTED_AUDIO.includes(ext);
}

function isSupportedImage(filename) {
  const ext = path.extname(filename).toLowerCase();
  return SUPPORTED_IMAGE.includes(ext);
}

function getAudioMimeType(audioPath) {
  const ext = path.extname(audioPath).toLowerCase();
  return MIME_TYPES.audio[ext] || 'audio/mpeg';
}

function getImageMimeType(imagePath) {
  const ext = path.extname(imagePath).toLowerCase();
  return MIME_TYPES.image[ext] || 'image/jpeg';
}

// ============================================
// DATABASE INITIALIZATION
// ============================================

async function initDatabase() {
  db = await open({
    filename: './sync-reader.db',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      folder TEXT UNIQUE,
      title TEXT,
      author TEXT,
      epub_path TEXT,
      srt_path TEXT,
      audio_path TEXT,
      cover_data TEXT,
      last_position REAL DEFAULT 0,
      match_start_element TEXT,
      match_start_segment INTEGER,
      bookmark_segment INTEGER,
      bookmark_time REAL,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS alignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_id INTEGER,
      segment_index INTEGER,
      text TEXT,
      start_time REAL,
      end_time REAL,
      epub_location TEXT,
      FOREIGN KEY (book_id) REFERENCES books(id)
    );

    CREATE INDEX IF NOT EXISTS idx_book_alignments ON alignments(book_id);
    CREATE INDEX IF NOT EXISTS idx_segment_index ON alignments(book_id, segment_index);
  `);
}

// ============================================
// BOOK PROCESSING HELPERS
// ============================================

async function processBookFolder(folderPath) {
  const folder = path.basename(folderPath);
  
  try {
    const files = await fs.readdir(folderPath);
    
    const epubFile = files.find(f => f.toLowerCase().endsWith('.epub'));
    const srtFile = files.find(f => f.toLowerCase().endsWith('.srt'));
    const audioFile = files.find(f => isSupportedAudio(f));

    if (!epubFile || !srtFile || !audioFile) {
      console.log(`⚠️ Incomplete set in ${folder}, skipping`);
      return null;
    }

    const epubPath = path.join(folderPath, epubFile);
    const srtPath = path.join(folderPath, srtFile);
    const audioPath = path.join(folderPath, audioFile);

    const metadata = await extractEpubMetadata(epubPath);

    return {
      folder,
      title: metadata.title || folder,
      author: metadata.author || 'Unknown',
      epubPath,
      srtPath,
      audioPath,
      coverData: metadata.cover
    };
  } catch (err) {
    console.error(`Error processing folder ${folder}:`, err.message);
    return null;
  }
}

async function upsertBook(book) {
  if (!book) return;
  
  await db.run(`
    INSERT INTO books (folder, title, author, epub_path, srt_path, audio_path, cover_data)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(folder) DO UPDATE SET
      title = excluded.title,
      author = excluded.author,
      epub_path = excluded.epub_path,
      srt_path = excluded.srt_path,
      audio_path = excluded.audio_path,
      cover_data = excluded.cover_data
  `, [book.folder, book.title, book.author, book.epubPath, 
      book.srtPath, book.audioPath, book.coverData]);
}

function findImageEntry(entries, imagePath, opfDir) {
  const strategies = [
    () => entries.find(e => e.entryName === imagePath),
    () => {
      const fullPath = path.join(opfDir, imagePath).replace(/\\/g, '/');
      return entries.find(e => e.entryName === fullPath);
    },
    () => entries.find(e => e.entryName.endsWith('/' + imagePath)),
    () => {
      const cleanPath = imagePath.replace(/^\/+/, '');
      return entries.find(e => 
        e.entryName === cleanPath || e.entryName.endsWith('/' + cleanPath)
      );
    },
    () => entries.find(e => 
      e.entryName.toLowerCase().includes(imagePath.toLowerCase()) &&
      isSupportedImage(e.entryName)
    ),
    () => {
      const filename = imagePath.split('/').pop();
      return entries.find(e => e.entryName.endsWith(filename));
    }
  ];

  for (const strategy of strategies) {
    const entry = strategy();
    if (entry) return entry;
  }

  return null;
}

// ============================================
// LIBRARY SCANNING
// ============================================

async function scanLibrary() {
  const LIBRARY_PATH = await getLibraryPath();
  console.log('📚 Scanning library:', LIBRARY_PATH);
  const folders = await fs.readdir(LIBRARY_PATH);
  
  let count = 0;
  for (const folder of folders) {
    const folderPath = path.join(LIBRARY_PATH, folder);
    const stat = await fs.stat(folderPath);
    
    if (!stat.isDirectory()) continue;

    const book = await processBookFolder(folderPath);
    if (book) {
      await upsertBook(book);
      count++;
      console.log(`✔ Found book: ${folder}`);
    }
  }

  // ✅ Clean up stale database entries (books deleted while server was offline)
  console.log('🧹 Checking for stale database entries...');
  const allDbBooks = await db.all('SELECT id, folder, epub_path FROM books');
  let removedCount = 0;
  
  for (const dbBook of allDbBooks) {
    try {
      await fs.access(dbBook.epub_path);
    } catch (err) {
      // File doesn't exist - remove from database
      console.log(`🗑️ Removing stale entry: "${dbBook.folder}" (files not found)`);
      await db.run('DELETE FROM alignments WHERE book_id = ?', dbBook.id);
      await db.run('DELETE FROM books WHERE id = ?', dbBook.id);
      removedCount++;
    }
  }
  
  if (removedCount > 0) {
    console.log(`✅ Removed ${removedCount} stale database entries`);
  }

  console.log(`✅ Scan complete. Found ${count} books.`);
}

async function scanSingleFolder(folderPath) {
  const book = await processBookFolder(folderPath);
  if (book) {
    await upsertBook(book);
    console.log(`✅ Added/updated book: "${book.folder}"`);
  }
}

// ============================================
// EPUB PARSER
// ============================================

async function extractEpubMetadata(epubPath) {
  try {
    const zip = new AdmZip(epubPath);
    const entries = zip.getEntries();
    
    let title = '';
    let author = '';
    let cover = null;

    const opfEntry = entries.find(e => e.entryName.endsWith('.opf') || e.entryName.includes('.opf'));
    if (opfEntry) {
      const opfContent = opfEntry.getData().toString('utf8');
      const opfDir = path.dirname(opfEntry.entryName);
      
      const titleMatch = opfContent.match(/<dc:title[^>]*>([^<]+)<\/dc:title>/i);
      if (titleMatch) title = titleMatch[1];
      
      const authorMatch = opfContent.match(/<dc:creator[^>]*>([^<]+)<\/dc:creator>/i);
      if (authorMatch) author = authorMatch[1];
      
      let coverHref = null;
      let coverEntry = null;
      
      const coverMetaMatch = opfContent.match(/<meta\s+name=["']cover["']\s+content=["']([^"']+)["']/i);
      if (coverMetaMatch) {
        const coverId = coverMetaMatch[1];
        const itemMatch = opfContent.match(new RegExp(`<item[^>]+id=["']${coverId}["'][^>]*href=["']([^"']+)["']`, 'i'));
        if (!itemMatch) {
          const itemMatch2 = opfContent.match(new RegExp(`<item[^>]+href=["']([^"']+)["'][^>]*id=["']${coverId}["']`, 'i'));
          if (itemMatch2) coverHref = itemMatch2[1];
        } else {
          coverHref = itemMatch[1];
        }
      }
      
      if (!coverHref) {
        const coverItemMatch = opfContent.match(/<item[^>]+properties=["'][^"']*cover-image[^"']*["'][^>]*href=["']([^"']+)["']/i);
        if (!coverItemMatch) {
          const coverItemMatch2 = opfContent.match(/<item[^>]+href=["']([^"']+)["'][^>]*properties=["'][^"']*cover-image[^"']*["']/i);
          if (coverItemMatch2) coverHref = coverItemMatch2[1];
        } else {
          coverHref = coverItemMatch[1];
        }
      }
      
      if (!coverHref) {
        const coverPattern = /<item[^>]+href=["']([^"']*(?:cover|Cover|COVER)[^"']*\.(?:jpg|jpeg|png|gif|webp))["']/i;
        const coverMatch = opfContent.match(coverPattern);
        if (coverMatch) coverHref = coverMatch[1];
      }
      
      if (!coverHref) {
        const coverPatterns = [
          /cover\.jpe?g$/i,
          /cover\.png$/i,
          /cover\.gif$/i,
          /cover[-_]?image\.jpe?g$/i,
          /cover[-_]?image\.png$/i,
          /coverimage\.jpe?g$/i,
          /coverimage\.png$/i,
          /^cover\.jpe?g$/i,
          /^cover\.png$/i
        ];
        
        for (const pattern of coverPatterns) {
          const found = entries.find(e => pattern.test(e.entryName.toLowerCase()));
          if (found) {
            coverEntry = found;
            console.log(`Found cover by pattern: ${found.entryName}`);
            break;
          }
        }
      }
      
      if (!coverHref && !coverEntry) {
        const imageEntry = entries.find(e => 
          (e.entryName.toLowerCase().includes('images') || 
           e.entryName.toLowerCase().includes('image')) &&
          isSupportedImage(e.entryName)
        );
        if (imageEntry) {
          coverEntry = imageEntry;
          console.log(`Using first image as cover: ${imageEntry.entryName}`);
        }
      }
      
      if (coverHref && !coverEntry) {
        coverHref = coverHref.replace(/&amp;/g, '&').replace(/&quot;/g, '"');
        
        let fullPath = path.join(opfDir, coverHref).replace(/\\/g, '/');
        coverEntry = entries.find(e => e.entryName === fullPath);
        
        if (!coverEntry) {
          coverEntry = entries.find(e => e.entryName === coverHref);
        }
        
        if (!coverEntry) {
          const cleanHref = coverHref.replace(/^\/+/, '');
          coverEntry = entries.find(e => e.entryName === cleanHref || e.entryName.endsWith('/' + cleanHref));
        }
        
        if (!coverEntry) {
          coverEntry = entries.find(e => 
            e.entryName.toLowerCase().includes(coverHref.toLowerCase()) &&
            isSupportedImage(e.entryName)
          );
        }
      }
      
      if (coverEntry) {
        try {
          const imageData = coverEntry.getData();
          const mimeType = getImageMimeType(coverEntry.entryName);
          cover = `data:${mimeType};base64,${imageData.toString('base64')}`;
          console.log(`✓ Extracted cover: ${coverEntry.entryName}`);
        } catch (err) {
          console.error(`Error extracting cover image data:`, err.message);
        }
      } else {
        console.log(`✗ No cover found for ${title || epubPath}`);
      }
    }

    return { title, author, cover };
  } catch (err) {
    console.error('Error extracting EPUB metadata:', err.message);
    return { title: '', author: '', cover: null };
  }
}

async function extractEpubHTML(epubPath) {
  try {
    const zip = new AdmZip(epubPath);
    const entries = zip.getEntries();
    
    console.log('Total entries in EPUB:', entries.length);
    
    const opfEntry = entries.find(e => e.entryName.endsWith('.opf') || e.entryName.includes('opf'));
    if (!opfEntry) {
      console.error('No OPF file found!');
      return [];
    }
    
    console.log('Found OPF:', opfEntry.entryName);
    const opfContent = opfEntry.getData().toString('utf8');
    const opfDir = path.dirname(opfEntry.entryName);

    const spineItems = [];
    const spineSection = opfContent.match(/<spine[^>]*>([\s\S]*?)<\/spine>/i);
    if (spineSection) {
      const itemRefs = spineSection[1].matchAll(/<itemref[^>]+idref=["']([^"']+)["']/gi);
      for (const match of itemRefs) {
        spineItems.push(match[1]);
      }
    }
    
    console.log('Spine items found:', spineItems);

    const manifestMap = {};
    const manifestSection = opfContent.match(/<manifest[^>]*>([\s\S]*?)<\/manifest>/i);
    
    if (manifestSection) {
      const itemMatches = manifestSection[1].matchAll(/<item\s+([^>]*?)\s*\/?>/gi);
      
      for (const match of itemMatches) {
        const attributes = match[1];
        
        const idMatch = attributes.match(/\bid=["']([^"']+)["']/i);
        const hrefMatch = attributes.match(/\bhref=["']([^"']+)["']/i);
        
        if (idMatch && hrefMatch) {
          const id = idMatch[1];
          const href = hrefMatch[1];
          manifestMap[id] = href;
          console.log(`📖 Mapping: ${id} -> ${href}`);
        }
      }
    }

    const htmlSections = [];
    let processedCount = 0;
    
    for (const itemId of spineItems) {
      const href = manifestMap[itemId];
      
      if (!href) {
        console.log(`❌ No href for: ${itemId}`);
        continue;
      }
      
      console.log(`📄 Processing: ${itemId} -> ${href}`);
      
      let fullPath = path.join(opfDir, href).replace(/\\/g, '/');
      let contentEntry = entries.find(e => e.entryName === fullPath);
      
      if (!contentEntry) contentEntry = entries.find(e => e.entryName === href);
      if (!contentEntry) {
        const itemPath = path.join('item', href).replace(/\\/g, '/');
        contentEntry = entries.find(e => e.entryName === itemPath);
      }
      if (!contentEntry) {
        contentEntry = entries.find(e => e.entryName.toLowerCase().includes(href.toLowerCase()));
      }
      
      if (!contentEntry) {
        console.log(`❌ Could not find: ${href}`);
        continue;
      }
      
      console.log(`✅ Found: ${contentEntry.entryName}`);
      
      try {
        let content = contentEntry.getData().toString('utf8');
        
        const bodyMatch = content.match(/<body[^>]*>([\s\S]*)<\/body>/i);
        if (bodyMatch) {
          content = bodyMatch[1];
        }
        
        content = content.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
        
        content = content
          .replace(/<ruby\b[^>]*>([\s\S]*?)<\/ruby>/gi, (match, inner) => {
            return inner.replace(/<rt[^>]*>[\s\S]*?<\/rt>/gi, '')
                       .replace(/<rp[^>]*>[\s\S]*?<\/rp>/gi, '');
          });

        content = content.replace(/src=["']([^"']*)["']/gi, (match, src) => {
          if (src.startsWith('http')) return match;
          let imagePath = src;
          if (src.startsWith('../')) imagePath = src.substring(3);
          else if (src.startsWith('./')) imagePath = src.substring(2);
          return `src="/api/books/BOOK_ID/image/${imagePath}"`;
        });

        content = content.replace(/xlink:href=["']([^"']*)["']/gi, (match, href) => {
          if (href.startsWith('http')) return match;
          let imagePath = href;
          if (href.startsWith('../')) imagePath = href.substring(3);
          else if (href.startsWith('./')) imagePath = href.substring(2);
          return `xlink:href="/api/books/BOOK_ID/image/${imagePath}"`;
        });
        
        content = content.replace(/<a\b[^>]*>/gi, '');
        content = content.replace(/<\/a>/gi, '');

        content = `
          <div class="epub-content" data-spine-id="${itemId}">
            ${content}
          </div>
        `;
        
        htmlSections.push(content);
        processedCount++;
        console.log(`📄 Added section ${processedCount}: ${itemId}`);
        
      } catch (contentErr) {
        console.error(`❌ Error: ${contentEntry.entryName}`, contentErr.message);
      }
    }
    
    let combinedCSS = '';
    const cssEntries = entries.filter(e => e.entryName.endsWith('.css'));

    for (const cssEntry of cssEntries) {
      try {
        let cssContent = cssEntry.getData().toString('utf8');
        cssContent = cssContent.replace(/\b(html|body)\s*[,{][^}]*}/gi, '');
        combinedCSS += `\n/* ${cssEntry.entryName} */\n${cssContent}`;
        console.log(`🎨 Added CSS: ${cssEntry.entryName}`);
      } catch (err) {
        console.log('Error reading CSS:', cssEntry.entryName, err.message);
      }
    }

    if (htmlSections.length > 0 && combinedCSS) {
      htmlSections[0] = `
        <style>
          .epub-content {
            font-size: 24px;
            line-height: 1.75;
          }
          
          .epub-content p {
            margin-top: 0px !important;
            margin-bottom: 0px !important;
          }
          
          ${combinedCSS}
        </style>
        ${htmlSections[0]}
      `;
    }
    
    console.log(`✅ Extracted ${htmlSections.length} sections`);
    return htmlSections;
    
  } catch (err) {
    console.error('❌ Error in extractEpubHTML:', err);
    return [];
  }
}

// ============================================
// SRT PARSER
// ============================================

function parseSRT(srtContent) {
  const segments = [];
  const blocks = srtContent.trim().split(/\n\s*\n/);

  for (const block of blocks) {
    const lines = block.trim().split('\n');
    if (lines.length < 3) continue;

    const timeMatch = lines[1].match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/);
    if (!timeMatch) continue;

    const startTime = 
      parseInt(timeMatch[1]) * 3600 +
      parseInt(timeMatch[2]) * 60 +
      parseInt(timeMatch[3]) +
      parseInt(timeMatch[4]) / 1000;

    const endTime = 
      parseInt(timeMatch[5]) * 3600 +
      parseInt(timeMatch[6]) * 60 +
      parseInt(timeMatch[7]) +
      parseInt(timeMatch[8]) / 1000;

    const text = lines.slice(2).join('').trim();

    if (text.length > 0) {
      segments.push({
        text,
        start: startTime,
        end: endTime
      });
    }
  }

  console.log(`Parsed ${segments.length} SRT segments`);
  return segments;
}

// ============================================
// API ENDPOINTS
// ============================================

app.get('/api/config', async (req, res) => {
  try {
    const fullConfig = await config.loadConfig();
    res.json(fullConfig);
  } catch (err) {
    errorResponse(res, `Failed to load config: ${err.message}`);
  }
});

app.post('/api/config/library-path', async (req, res) => {
  try {
    const { path: newPath } = req.body;
    
    if (!newPath) {
      return errorResponse(res, 'Path is required', 400);
    }
    
    // Verify the path exists
    try {
      await fs.access(newPath);
    } catch (err) {
      return errorResponse(res, 'Path does not exist or is not accessible', 400);
    }
    
    const success = await config.setLibraryPath(newPath);
    
    if (success) {
      // Rescan library with new path
      await scanLibrary();
      res.json({ success: true, path: newPath });
    } else {
      errorResponse(res, 'Failed to save config');
    }
  } catch (err) {
    errorResponse(res, `Failed to update library path: ${err.message}`);
  }
});


// ✅ OPTIMIZATION: Don't send cover_data by default (it's huge!)
app.get('/api/books', async (req, res) => {
  try {
    const books = await db.all(`
      SELECT * FROM books 
      ORDER BY sort_order ASC, title ASC
    `);
    
    // Set cache headers
    res.json(books);
  } catch (err) {
    errorResponse(res, `Failed to fetch books: ${err.message}`);
  }
});

app.post('/api/books/sort', async (req, res) => {
  try {
    const { sortedBooks } = req.body;
    
    await withTransaction(async () => {
      for (const book of sortedBooks) {
        await db.run(
          'UPDATE books SET sort_order = ? WHERE id = ?',
          [book.sort_order, book.id]
        );
      }
    });
    
    res.json({ success: true });
  } catch (err) {
    errorResponse(res, `Failed to update book order: ${err.message}`);
  }
});

app.post('/api/books/:id/cache-html', async (req, res) => {
  try {
    const { processedHtml } = req.body;
    
    await db.run(
      'DELETE FROM alignments WHERE book_id = ? AND segment_index = -2',
      [req.params.id]
    );
    
    await db.run(
      'INSERT INTO alignments (book_id, segment_index, text, start_time, end_time, epub_location) VALUES (?, ?, ?, ?, ?, ?)',
      [req.params.id, -2, JSON.stringify(processedHtml), 0, 0, 'processed_html']
    );
    
    console.log(`✅ Cached processed HTML for book ${req.params.id}`);
    res.json({ success: true });
  } catch (err) {
    errorResponse(res, `Failed to cache HTML: ${err.message}`);
  }
});

app.post('/api/books/:id/clear-cache', async (req, res) => {
  try {
    // Delete processed HTML cache (segment_index = -2)
    await db.run(
      'DELETE FROM alignments WHERE book_id = ? AND segment_index = -2',
      [req.params.id]
    );
    
    // Clear all segment mappings (reset epub_location to '-1')
    await db.run(
      'UPDATE alignments SET epub_location = ? WHERE book_id = ? AND segment_index >= 0',
      ['-1', req.params.id]
    );
    
    console.log(`✅ Cleared cache for book ${req.params.id}`);
    res.json({ success: true });
  } catch (err) {
    errorResponse(res, `Failed to clear cache: ${err.message}`);
  }
});

app.get('/api/books/:id/content', async (req, res) => {
  console.log('=== Content request for book', req.params.id, '===');
  
  try {
    const book = await db.get('SELECT * FROM books WHERE id = ?', req.params.id);
    console.log('Book query result:', book ? `Found: ${book.title}` : 'Not found');
    
    if (!book) return errorResponse(res, 'Book not found', 404);

    const processedHtmlRow = await db.get(
      'SELECT text FROM alignments WHERE book_id = ? AND segment_index = -2',
      book.id
    );

    let segments = await db.all(
      'SELECT * FROM alignments WHERE book_id = ? AND segment_index >= 0 ORDER BY segment_index',
      book.id
    );
    console.log(`>>> Found ${segments.length} existing segments in database for book ${book.id}`);
    
    let htmlSections = [];
    let useProcessedHtml = false;

    if (processedHtmlRow && segments.length > 0) {
      console.log('>>> Using cached processed HTML - instant load!');
      htmlSections = JSON.parse(processedHtmlRow.text);
      useProcessedHtml = true;
    } else if (segments.length === 0) {
      console.log('>>> No cached data - starting fresh extraction');
      console.log('Processing book:', book.title);
      
      htmlSections = await extractEpubHTML(book.epub_path);
      
      if (htmlSections.length === 0) {
        console.error('Failed to extract HTML from EPUB!');
        return errorResponse(res, 'Could not extract EPUB content');
      }
      
      const srtContent = await fs.readFile(book.srt_path, 'utf8');
      const srtSegments = parseSRT(srtContent);
      
      await db.run(`
        INSERT INTO alignments (book_id, segment_index, text, start_time, end_time, epub_location)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [book.id, -1, JSON.stringify(htmlSections), 0, 0, 'html']);
      
      console.log('Saving segments in batches...');
      for (let i = 0; i < srtSegments.length; i += BATCH_SIZE) {
        const batch = srtSegments.slice(i, i + BATCH_SIZE);
        const placeholders = batch.map(() => '(?, ?, ?, ?, ?, ?)').join(',');
        const values = batch.flatMap((seg, idx) => [
          book.id,
          i + idx,
          seg.text,
          seg.start,
          seg.end,
          '-1'
        ]);
        
        await db.run(
          `INSERT INTO alignments (book_id, segment_index, text, start_time, end_time, epub_location) VALUES ${placeholders}`,
          values
        );
        
        console.log(`Saved ${Math.min(i + BATCH_SIZE, srtSegments.length)}/${srtSegments.length} segments`);
      }
      
      segments = await db.all('SELECT * FROM alignments WHERE book_id = ? AND segment_index >= 0 ORDER BY segment_index', book.id);
      console.log(`>>> All ${segments.length} segments now in database`);
    } else {
      console.log('>>> Loading raw HTML from cache');
      const htmlRow = await db.get('SELECT text FROM alignments WHERE book_id = ? AND segment_index = -1', book.id);
      if (htmlRow) {
        htmlSections = JSON.parse(htmlRow.text);
        console.log(`>>> Loaded ${htmlSections.length} HTML sections from cache`);
      }
    }

    const processedHtml = htmlSections.map(html => 
      html.replace(/BOOK_ID/g, book.id.toString())
    );

    console.log(`>>> Sending response: ${processedHtml.length} sections, ${segments.length} segments, processed: ${useProcessedHtml}`);

    // ✅ Set cache headers for content
    res.set('Cache-Control', 'private, max-age=600'); // 10 minutes
    
    res.json({
      book,
      htmlSections: processedHtml,
      segments: segments.map(s => ({
        id: s.id,
        text: s.text,
        start: s.start_time,
        end: s.end_time,
        elementId: s.epub_location
      })),
      hasProcessedHtml: useProcessedHtml
    });
  } catch (err) {
    console.error('Error loading book content:', err);
    errorResponse(res, `Failed to load book content: ${err.message}`);
  }
});

app.get('/api/books/:id/audio', async (req, res) => {
  try {
    const book = await db.get('SELECT audio_path FROM books WHERE id = ?', req.params.id);
    if (!book) {
      return errorResponse(res, 'Book not found', 404);
    }

    const audioPath = path.resolve(book.audio_path);
    const stat = await fs.stat(audioPath);
    const fileSize = stat.size;
    const range = req.headers.range;
    const mimeType = getAudioMimeType(book.audio_path);

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;

      const readStream = require('fs').createReadStream(audioPath, { start, end });
      
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable' // ✅ Cache audio forever
      });
      
      readStream.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': mimeType,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=31536000, immutable'
      });
      
      require('fs').createReadStream(audioPath).pipe(res);
    }
  } catch (err) {
    errorResponse(res, `Error serving audio: ${err.message}`);
  }
});

app.get('/api/books/:id/image/:imagePath(*)', async (req, res) => {
  try {
    const book = await db.get('SELECT epub_path FROM books WHERE id = ?', req.params.id);
    if (!book) {
      return errorResponse(res, 'Book not found', 404);
    }
    
    const zip = new AdmZip(book.epub_path);
    const entries = zip.getEntries();
    const imagePath = req.params.imagePath;
    
    const opfEntry = entries.find(e => e.entryName.endsWith('.opf'));
    const opfDir = opfEntry ? path.dirname(opfEntry.entryName) : '';
    
    const imageEntry = findImageEntry(entries, imagePath, opfDir);
    
    if (!imageEntry) {
      console.log('Image not found:', imagePath);
      return errorResponse(res, 'Image not found', 404);
    }
    
    const data = imageEntry.getData();
    const mimeType = getImageMimeType(imageEntry.entryName);
    
    // ✅ Aggressive caching for images
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    res.contentType(mimeType);
    res.send(data);
  } catch (err) {
    errorResponse(res, `Error loading image: ${err.message}`);
  }
});

app.post('/api/books/:id/position', async (req, res) => {
  try {
    const { position } = req.body;
    await db.run('UPDATE books SET last_position = ? WHERE id = ?', [position, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    errorResponse(res, `Failed to save position: ${err.message}`);
  }
});

app.post('/api/books/:id/bookmark', async (req, res) => {
  try {
    const { segmentIndex, time } = req.body;
    await db.run(
      'UPDATE books SET bookmark_segment = ?, bookmark_time = ? WHERE id = ?',
      [segmentIndex, time, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    errorResponse(res, `Failed to save bookmark: ${err.message}`);
  }
});

app.post('/api/books/:id/matching', async (req, res) => {
  try {
    const { startElement, startSegment, mappings } = req.body;
    
    await db.run(
      'UPDATE books SET match_start_element = ?, match_start_segment = ? WHERE id = ?',
      [startElement, startSegment, req.params.id]
    );
    
    if (mappings && Object.keys(mappings).length > 0) {
      console.log(`Saving ${Object.keys(mappings).length} segment mappings...`);
      
      const entries = Object.entries(mappings);
      
      for (let i = 0; i < entries.length; i += BATCH_SIZE) {
        const batch = entries.slice(i, i + BATCH_SIZE);
        
        await withTransaction(async () => {
          for (const [segmentIndex, elementId] of batch) {
            await db.run(
              'UPDATE alignments SET epub_location = ? WHERE book_id = ? AND segment_index = ?',
              [elementId, req.params.id, parseInt(segmentIndex)]
            );
          }
        });
        
        console.log(`Saved ${Math.min(i + BATCH_SIZE, entries.length)}/${entries.length} mappings`);
      }
      
      console.log('All mappings saved to database!');
    }
    
    res.json({ success: true });
  } catch (err) {
    errorResponse(res, `Failed to save matching: ${err.message}`);
  }
});

app.post('/api/scan', async (req, res) => {
  try {
    await scanLibrary();
    res.json({ success: true });
  } catch (err) {
    errorResponse(res, `Failed to scan library: ${err.message}`);
  }
});

// ============================================
// STARTUP
// ============================================

async function start() {
  await initDatabase();
  const LIBRARY_PATH = await getLibraryPath();
  await scanLibrary();

  const watcher = chokidar.watch(LIBRARY_PATH, {
    ignored: /(^|[\/\\])\../,
    persistent: true,
    depth: 1,
    awaitWriteFinish: { stabilityThreshold: 2000, pollInterval: 100 }
  });

  watcher.on('addDir', async (folderPath) => {
    console.log(`🆕 New folder detected: ${folderPath}`);
    await scanSingleFolder(folderPath);
  });

  watcher.on('add', async (filePath) => {
    const parent = path.dirname(filePath);
    console.log(`📝 New file in ${parent}: ${path.basename(filePath)}`);
    await scanSingleFolder(parent);
  });

  watcher.on('unlinkDir', async (removedFolderPath) => {
    console.log(`🗑️ Folder removed: ${removedFolderPath}`);

    const folderName = path.basename(removedFolderPath);

    try {
      const book = await db.get('SELECT id FROM books WHERE folder = ?', folderName);

      if (!book) {
        console.log(`⚠️ No DB entry for folder "${folderName}" – nothing to delete`);
        return;
      }

      await db.run('DELETE FROM alignments WHERE book_id = ?', book.id);
      await db.run('DELETE FROM books WHERE id = ?', book.id);

      console.log(`✅ Removed book "${folderName}" (id=${book.id}) from the database`);
    } catch (err) {
      console.error(`❌ Error cleaning up deleted folder "${folderName}":`, err.message);
    }
  });

  process.on('SIGINT', () => { watcher.close(); process.exit(); });

  app.listen(PORT, '0.0.0.0', () => {
    console.log('\n✓ Sync Reader Server running!');
    console.log(`  Local: http://localhost:${PORT}`);
    console.log(`  Library path: ${LIBRARY_PATH}`);
  });
}

start().catch(console.error);