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



const upload = multer({
  dest: path.join(APP_ROOT, 'tmp'),
  fileFilter(req, file, cb) {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  }
});

function getNode(obj, pathStr) {
  if (!pathStr) return obj;
  return pathStr.split('/').reduce((cur, key) => cur?.[key], obj);
}
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
// Upload images (MULTI)
router.post('/upload-image',
  requireLogin,
  upload.array('images', 20),
  async (req, res) => {
    try {
      const currentPath = req.body.currentPath || '';
      const targetFolder = path.join(EVENTS_ROOT, currentPath);

      if (!targetFolder.startsWith(EVENTS_ROOT)) {
        return res.status(403).send('Access denied');
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).send('No images uploaded');
      }

      // Ensure folders exist
      const thumbsFolder = path.join(targetFolder, 'thumbs');
      await fs.mkdir(targetFolder, { recursive: true });
      await fs.mkdir(thumbsFolder, { recursive: true });

      // Process each uploaded image
      for (const file of req.files) {
        const inputPath = file.path;
        const baseName = path.parse(file.originalname).name;

        const fullImagePath = path.join(targetFolder, baseName + '.webp');
        const thumbImagePath = path.join(thumbsFolder, baseName + '.webp');

        // FULL IMAGE
        await sharp(inputPath)
          .resize({ width: 1200, withoutEnlargement: true })
          .webp({ quality: 80 })
          .toFile(fullImagePath);

        // THUMBNAIL
        await sharp(inputPath)
          .resize({ width: 150, withoutEnlargement: true })
          .webp({ quality: 65 })
          .toFile(thumbImagePath);

        // Remove temp file
        await fs.unlink(inputPath);
      }

      // Back to admin view
      res.redirect(`/admin/events?path=${encodeURIComponent(currentPath)}`);

    } catch (err) {
      console.error(err);
      res.status(500).send('Error processing images');
    }
  }
);
router.post('/rotation', requireLogin, async (req, res) => {
  try {
    const { file, angle } = req.body;
    if (!file || typeof angle !== 'number') {
      return res.status(400).json({ error: 'Invalid parameters' });
    }
    const originalPath = path.join(EVENTS_ROOT, file);
    await fs.access(originalPath);
    // ---- ROTATE ORIGINAL (buffer → overwrite) ----
    const rotatedOriginal = await sharp(originalPath)
      .rotate(angle)
      .toBuffer();
    await fs.writeFile(originalPath, rotatedOriginal);
    res.json({ ok: true });
  } catch (err) {
    console.error('Rotation failed:', err);
    res.status(500).json({ error: 'Rotation failed' });
  }
});
router.post('/rotation-thumbs', requireLogin, async (req, res) => {
  console.log('Rotation-thumbs request:', req.body);
  try {
    const { file, angle } = req.body;
    if (!file || typeof angle !== 'number') {
      return res.status(400).json({ error: 'Invalid parameters' });
    }
    const originalPath = path.join(EVENTS_ROOT, file);
    const thumbPath = path.join(path.dirname(originalPath),'thumbs',
      path.basename(originalPath)
    );
    await fs.access(thumbPath);
    const rotatedThumb = await sharp(thumbPath)
      .rotate(angle)
      .toBuffer();
      await fs.writeFile(thumbPath, rotatedThumb);
   res.json({ ok: true });
  } catch (err) {
    console.error('Rotation-thumbs failed:', err);
    res.status(500).json({ error: 'Rotation-thumbs failed' });
  }
});
module.exports = router;
