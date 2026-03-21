const express = require('express');
const router = express.Router();
const fs = require('fs/promises');
const path = require('path');
const multer = require('multer');
const readDir = require(path.join(APP_ROOT, 'helpers', 'readDir'));
const transformDirList = require(path.join(APP_ROOT, 'helpers', 'transformDirList'));
const storeDirInTree = require(path.join(APP_ROOT, 'helpers', 'storeDirInTree'));
const requireLogin = require(path.join(APP_ROOT,  'middleware', 'auth'));
const BULLETINS_ROOT = path.join(APP_ROOT, 'content/bulletin_files');

let tree = {};

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
const upload = multer({
  storage: multer.memoryStorage(), // IMPORTANT (so sharp can use buffer)
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});
router.get('/', requireLogin, (req, res) => {
  tree = {};
  res.render('pages/admin/bulletin_files', {
    layout: 'layouts/admin',
    title: 'Bulletin_files - admin',
    lang: 'en',
    page: 'bulletin_files',
    favicon: '/images/logo-olqa-mini.png',
    msg: req.query.msg || null,
    status: req.query.status || null
  });
});
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
router.post('/create-folder', requireLogin, async (req, res) => {
  try {
    let msg = 'Nothing selected';
    let status = 'error';
    const currentPath = req.body.currentPath || '';
    const folderName = req.body.folderName;
    if (!folderName) {
        msg = 'Folder name is required';
        status = 'error';
        return res.redirect(`/admin/bulletin_files?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`);
    }
    const safeName = folderName.replace(/[/\\?%*:|"<>]/g, '-');
    const newFolderPath = path.join(BULLETINS_ROOT, currentPath, safeName);
    await fs.mkdir(newFolderPath, { recursive: true });
    msg = `Folder "${folderName}" created successfully in "${currentPath || 'root'}"`;
    status = 'success';
    res.redirect(`/admin/bulletin_files?path=${encodeURIComponent(currentPath)}&msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`);
  } catch (err) {
    console.error(err);
    msg = 'Server error while creating folder';
    res.redirect(`/admin/bulletin_files?msg=${encodeURIComponent(msg)}&status=error`);
  }
});
router.post('/delete-selected', requireLogin, async (req, res) => {
  let messageType = 'error';
  let msg = '';
  try {
    const folder = req.body.folder;
    const files = JSON.parse(req.body.files || '[]');
  for (const file of files) {
  const filePath = path.join(BULLETINS_ROOT, file);
  await fs.rm(filePath, { force: true });
   msg += `Deleted file: ${file}\n`;
}
if (folder) {
  const folderPath = path.join(BULLETINS_ROOT, folder);
  await fs.rm(folderPath, { recursive: true, force: true });
  msg += `Deleted folder: ${folder}\n`;
}
    messageType = 'success';
  } catch (err) {
    console.error(err);
    msg = err.message || 'Server error';
    res.redirect(`/admin/bulletin_files?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(messageType)}`);
  }
  res.redirect(`/admin/bulletin_files?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(messageType)}`);
});
const sharp = require('sharp');

router.post('/load-file', requireLogin, upload.single('image'), async (req, res) => {
  try {
    const currentPath = req.body.currentPath || '';
    const targetDir = path.join(BULLETINS_ROOT, currentPath);

    if (!targetDir.startsWith(BULLETINS_ROOT)) {
      return res.status(403).send('Access denied');
    }

    if (!req.file) {
      const msg = 'No image uploaded';
      return res.redirect(`/admin/bulletin_files?msg=${encodeURIComponent(msg)}&status=error`);
    }

    // Clean filename
    const baseName = path.parse(req.file.originalname).name
      .replace(/[/\\?%*:|"<>]/g, '-');

    const finalFileName = baseName + '.webp';
    const finalPath = path.join(targetDir, finalFileName);

    await fs.mkdir(targetDir, { recursive: true });

    // Convert to WebP
    await sharp(req.file.buffer)
      .rotate()
      .resize({
        width: 1200,          // adjust if needed
        height: 1600,         // bulletin-friendly ratio
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: 80 })
      .toFile(finalPath);

    const msg = `Bulletin "${finalFileName}" uploaded successfully`;
    res.redirect(`/admin/bulletin_files?path=${encodeURIComponent(currentPath)}&msg=${encodeURIComponent(msg)}&status=success`);

  } catch (err) {
    const msg = err.message || 'Upload failed';
    res.redirect(`/admin/bulletin_files?msg=${encodeURIComponent(msg)}&status=error`);
  }
});
module.exports = router;
