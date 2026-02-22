const express = require('express');
const router = express.Router();
const fs = require('fs/promises');
const path = require('path');
const multer = require('multer');
const { PDFDocument } = require('pdf-lib');
const readDir = require(path.join(APP_ROOT, 'helpers', 'readDir'));
const transformDirList = require(path.join(APP_ROOT, 'helpers', 'transformDirList'));
const storeDirInTree = require(path.join(APP_ROOT, 'helpers', 'storeDirInTree'));
const requireLogin = require(path.join(APP_ROOT,  'middleware', 'auth'));
const BULLETINS_ROOT = path.join(APP_ROOT, 'content/bulletins');
const MAX_PDF_SIZE = 300 * 1024; // 300 KB

let tree = {};

/* ============================================================
   INTERNAL HELPERS (kept in this file)
============================================================ */

function getNode(obj, pathStr) {
  if (!pathStr) return obj;
  return pathStr.split('/').reduce((cur, key) => cur?.[key], obj);
}

async function validateAndCompressPdf(buffer) {
  const pdfDoc = await PDFDocument.load(buffer);

  if (pdfDoc.getPageCount() !== 1) {
    throw new Error('PDF must contain exactly one page');
  }

  let output = buffer;

  if (buffer.length > MAX_PDF_SIZE) {
    output = await pdfDoc.save({
      useObjectStreams: true,
      compress: true
    });
  }

  if (output.length > MAX_PDF_SIZE) {
    throw new Error('PDF exceeds 300 KB even after compression');
  }

  return output;
}

/* ============================================================
   MULTER (PDF only, memory)
============================================================ */

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter(req, file, cb) {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed'));
    }
    cb(null, true);
  }
});

/* ============================================================
   ROUTES
============================================================ */

// Admin about page
router.get('/', requireLogin, (req, res) => {
  tree = {};
  res.render('pages/admin/bulletin', {
    layout: 'layouts/admin',
    title: 'Bulletin - admin',
    lang: 'en',
    page: 'bulletin',
    favicon: '/images/logo-olqa-mini.png',
    msg: req.query.msg || null,
    status: req.query.status || null
  });
});

// List directories (AJAX)
router.get('/ls', requireLogin, async (req, res) => {
  try {
    const relativePath = req.query.path || '';
    const content = transformDirList(
      await readDir(BULLETINS_ROOT, relativePath)
    );
    storeDirInTree(tree, relativePath, content);
    res.json(getNode(tree, relativePath));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Create folder
router.post('/create-folder', requireLogin, async (req, res) => {

  try {
    let msg = 'Nothing selected';
    let status = 'error';
    const currentPath = req.body.currentPath || '';
    const folderName = req.body.folderName;
    if (!folderName) {
        msg = 'Folder name is required';
        status = 'error';
        return res.redirect(`/admin/bulletin?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`);
    }
    const safeName = folderName.replace(/[/\\?%*:|"<>]/g, '-');
    const newFolderPath = path.join(BULLETINS_ROOT, currentPath, safeName);
    await fs.mkdir(newFolderPath, { recursive: true });
    msg = `Folder "${folderName}" created successfully`;
    status = 'success';
    res.redirect(`/admin/bulletin?path=${encodeURIComponent(currentPath)}&msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`);
  } catch (err) {
    console.error(err);
    msg = 'Server error while creating folder';
    res.redirect(`/admin/bulletin?msg=${encodeURIComponent(msg)}&status=error`);
  }
});
router.post('/delete-selected', requireLogin, async (req, res) => {
  try {
    const { files, folder } = req.body; // get files array and folder
    if (files && files.length) {
      const list = Array.isArray(files) ? files : [files];
      for (const relPath of list) {
        const fullPath = path.join(BULLETINS_ROOT, relPath);
        if (!fullPath.startsWith(BULLETINS_ROOT)) continue;
        // Delete the file
        await fs.rm(fullPath, { force: true });
      }
    }
    if (folder) {
      const fullFolder = path.join(BULLETINS_ROOT, folder);
      if (!fullFolder.startsWith(BULLETINS_ROOT)) {
        return res.status(403).send('Access denied');
      }
      // Delete folder recursively
      await fs.rm(fullFolder, { recursive: true, force: true });
    }
      const msg = `PDF  was successfully deleted`;
      const status = 'success';
      res.redirect(`/admin/bulletin?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`);
      //res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Delete failed' });
  }
});
router.post('/load-file', requireLogin, upload.single('pdf'), async (req, res) => {
  try {
    const currentPath = req.body.currentPath || '';
    const targetDir = path.join(BULLETINS_ROOT, currentPath);
    if (!targetDir.startsWith(BULLETINS_ROOT)) {
      return res.status(403).send('Access denied');
    }
    if (!req.file) {
      const msg = 'No PDF uploaded';
      const status = 'error';
      return res.redirect(`/admin/bulletin?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`);
    }

    // sanitize filename
    const safeName = req.file.originalname.replace(/[/\\?%*:|"<>]/g, '-');
    const finalPdf = await validateAndCompressPdf(req.file.buffer);
    await fs.mkdir(targetDir, { recursive: true });
    await fs.writeFile(path.join(targetDir, safeName), finalPdf);
    const msg = `PDF "${safeName}" uploaded successfully to "${targetDir || 'root'}"`;
    const status = 'success';
    res.redirect(`/admin/bulletin?path=${encodeURIComponent(currentPath)}&msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`);
  } catch (err) {
    console.error(err);
    const msg = err.message || 'Upload failed';
    const status = 'error';
    res.redirect(`/admin/bulletin?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`);
  }
});

/* ============================================================
   EXPORT
============================================================ */

module.exports = router;
