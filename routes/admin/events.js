const express = require('express');
const router = express.Router();
const fs = require('fs/promises');
const path = require('path');
const multer = require('multer');
const sharp = require('sharp');
const requireLogin = require(path.join(APP_ROOT, 'middleware', 'auth'));

const readDir = require(path.join(APP_ROOT, 'helpers', 'readDir'));
const transformDirList = require(path.join(APP_ROOT, 'helpers', 'transformDirList'));
const storeDirInTree = require(path.join(APP_ROOT, 'helpers', 'storeDirInTree'));

const EVENTS_ROOT = path.join(APP_ROOT, 'content/events');
let tree = {};

// -------------------
// Multer (images only)
// -------------------
const upload = multer({
  dest: path.join(APP_ROOT, 'tmp'),
  fileFilter(req, file, cb) {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  }
});

// -------------------
// Helpers
// -------------------
function getNode(obj, pathStr) {
  if (!pathStr) return obj;
  return pathStr.split('/').reduce((cur, key) => cur?.[key], obj);
}

// -------------------
// Routes
// -------------------

// Admin Events page
router.get('/', requireLogin, (req, res) => {
  tree = {};
  res.render('pages/admin/events', {
    layout: 'layouts/admin',
    title: 'Events - admin',
    lang: 'en',
    page: 'events',
    favicon: '/images/logo-olqa-mini.png'
  });
});

// List directories (AJAX)
router.get('/ls', requireLogin, async (req, res) => {
  try {
    const relativePath = req.query.path || '';
    const content = transformDirList(await readDir(EVENTS_ROOT, relativePath));
    storeDirInTree(tree, relativePath, content);
    res.json(getNode(tree, relativePath));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create folder
router.post('/create-folder', requireLogin, async (req, res) => {
  try {
    const currentPath = req.body.currentPath || '';
    const folderName = req.body.folderName;
    if (!folderName) return res.status(400).send('Folder name required');

    const safeName = folderName.replace(/[/\\?%*:|"<>]/g, '-');
    const newFolderPath = path.join(EVENTS_ROOT, currentPath, safeName);

    await fs.mkdir(newFolderPath, { recursive: true });
    res.redirect(`/admin/events?path=${encodeURIComponent(currentPath)}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating folder');
  }
});

// Delete selected
router.post('/delete-selected', requireLogin, async (req, res) => {
  try {
    const { files, folder } = req.body; // get files array and folder

    // 1️⃣ MULTI FILE DELETE
    if (files && files.length) {
      const list = Array.isArray(files) ? files : [files];

      for (const relPath of list) {
        const fullPath = path.join(EVENTS_ROOT, relPath);

        if (!fullPath.startsWith(EVENTS_ROOT)) continue;

        // Delete the file
        await fs.rm(fullPath, { force: true });

        // Delete thumbnail if exists
        const thumb = path.join(
          path.dirname(fullPath),
          'thumbs',
          path.basename(fullPath)
        );
        await fs.rm(thumb, { force: true }).catch(() => {});
      }
    }

    // 2️⃣ FOLDER DELETE
    if (folder) {
      const fullFolder = path.join(EVENTS_ROOT, folder);

      if (!fullFolder.startsWith(EVENTS_ROOT)) {
        return res.status(403).send('Access denied');
      }

      // Delete folder recursively
      await fs.rm(fullFolder, { recursive: true, force: true });
    }

    // Respond JSON for the browser
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Delete failed' });
  }
});

// Upload image
router.post(
  '/upload-image',
  requireLogin,
  upload.single('image'),
  async (req, res) => {
    try {
      const currentPath = req.body.currentPath || '';
      const targetFolder = path.join(EVENTS_ROOT, currentPath);

      // Safety check
      if (!targetFolder.startsWith(EVENTS_ROOT)) {
        return res.status(403).send('Access denied');
      }

      if (!req.file) {
        return res.status(400).send('No image uploaded');
      }

      // Ensure target + thumbs folders exist
      const thumbsFolder = path.join(targetFolder, 'thumbs');
      await fs.mkdir(targetFolder, { recursive: true });
      await fs.mkdir(thumbsFolder, { recursive: true });

      const inputPath = req.file.path;
      const baseName = path.parse(req.file.originalname).name;

      const fullImagePath = path.join(targetFolder, baseName + '.webp');
      const thumbImagePath = path.join(thumbsFolder, baseName + '.webp');

      // FULL IMAGE (display / open in new window)
      await sharp(inputPath)
        .resize({ width: 1200, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(fullImagePath);

      // THUMBNAIL (folder preview)
      await sharp(inputPath)
        .resize({ width: 150, withoutEnlargement: true })
        .webp({ quality: 65 })
        .toFile(thumbImagePath);

      // Remove temp upload
      await fs.unlink(inputPath);

      // Back to admin view
      res.redirect(`/admin/events?path=${encodeURIComponent(currentPath)}`);
    } catch (err) {
      console.error(err);
      res.status(500).send('Error processing image');
    }
  }
);


module.exports = router;
