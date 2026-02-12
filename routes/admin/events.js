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
router.get('/', requireLogin, (req, res) => {
  tree = {};
  res.render('pages/admin/events', {
    layout: 'layouts/admin',
    title: 'Events - admin',
    lang: 'en',
    page: 'events',
    favicon: '/images/logo-olqa-mini.png',
    msg: req.query.msg || null,
    status: req.query.status || null
  });
});
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
router.post('/create-folder', requireLogin, async (req, res) => {
  try {
    const currentPath = req.body.currentPath || '';
    const folderName = req.body.folderName;
    if (!folderName) {
      const msg = 'Folder name is required';
      const status = 'error';
      return res.redirect(
        `/admin/events?path=${encodeURIComponent(currentPath)}&msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`
      );
    }

    const safeName = folderName.replace(/[/\\?%*:|"<>]/g, '-');
    const newFolderPath = path.join(EVENTS_ROOT, currentPath, safeName);

    await fs.mkdir(newFolderPath, { recursive: true });
      const folderDisplay = currentPath ? `/${currentPath}` : '/';
      const msg = encodeURIComponent(`Folder created successfully in ${folderDisplay}`);
      const status = 'success';
        res.redirect(
          `/admin/events?path=${encodeURIComponent(currentPath)}&msg=${msg}&status=${status}`
        );
  } catch (err) {
    console.error(err);

    const msg = 'Error creating folder';
    const status = 'error';

    res.redirect(
      `/admin/events?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`
    );
  }
});
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
router.post('/upload-image',
  requireLogin,
  upload.array('images', 20),
  async (req, res) => {
    try {
      const currentPath = req.body.currentPath || '';
      const targetFolder = path.join(EVENTS_ROOT, currentPath);

      // ❌ Security check
      if (!targetFolder.startsWith(EVENTS_ROOT)) {
        const msg = 'Access denied';
        const status = 'error';
        return res.redirect(
          `/admin/events?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`
        );
      }

      // ❌ No files
      if (!req.files || req.files.length === 0) {
        const msg = 'No images selected';
        const status = 'error';
        return res.redirect(
          `/admin/events?path=${encodeURIComponent(currentPath)}&msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`
        );
      }

      const thumbsFolder = path.join(targetFolder, 'thumbs');
      await fs.mkdir(targetFolder, { recursive: true });
      await fs.mkdir(thumbsFolder, { recursive: true });

      for (const file of req.files) {
        const inputPath = file.path;
        const baseName = path.parse(file.originalname).name;

        const fullImagePath = path.join(targetFolder, baseName + '.webp');
        const thumbImagePath = path.join(thumbsFolder, baseName + '.webp');

        await sharp(inputPath)
          .resize({ width: 1200, withoutEnlargement: true })
          .webp({ quality: 80 })
          .toFile(fullImagePath);

        await sharp(inputPath)
          .resize({ width: 150, withoutEnlargement: true })
          .webp({ quality: 65 })
          .toFile(thumbImagePath);

        await fs.unlink(inputPath);
      }
      const folderDisplay = currentPath ? `/${currentPath}` : '/';
      const msg = encodeURIComponent(`Images uploaded successfully to ${folderDisplay}`);
      const status = 'success';
        res.redirect(
          `/admin/events?path=${encodeURIComponent(currentPath)}&msg=${msg}&status=${status}`
        );
    } catch (err) {
      console.error(err);

      const msg = 'Error processing images';
      const status = 'error';

      res.redirect(
        `/admin/events?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`
      );
    }
  }
);
router.post('/rotation', requireLogin, async (req, res) => {
  try {
    const { file, angle } = req.body;
    if (!file || typeof angle !== 'number') {
      return res.status(400).json({
          ok: false,
          status: 'error',
          msg: 'Invalid parameters'
        });
    }
    const originalPath = path.join(EVENTS_ROOT, file);
    await fs.access(originalPath);
    const rotatedOriginal = await sharp(originalPath)
      .rotate(angle)
      .toBuffer();
    await fs.writeFile(originalPath, rotatedOriginal);
    const msg =  `Images uploaded successfully to ${file}. You can verify this in the user view after refreshing the page.`
    return res.json({
        ok: true,
        status: 'success',
        msg: msg
      });
  } catch (err) {
      return  res.status(500).json({
        ok: false,
        status: 'error',
        msg: 'Rotation failed'
      });
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
