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
const PHOTOS_ROOT = path.join(APP_ROOT, 'content/photos_files');
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
  res.render('pages/admin/photos_files', {
    layout: 'layouts/admin',
    title: 'Photos - admin',
    lang: 'en',
    page: 'photos_files',
    favicon: '/images/logo-olqa-mini.png',
    msg: req.query.msg || null,
    status: req.query.status || null
  });
});
router.get('/ls', requireLogin, async (req, res) => {
  try {
    const relativePath = req.query.path || '';
    const content = transformDirList(await readDir(PHOTOS_ROOT, relativePath));
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
        `/admin/photos_files?path=${encodeURIComponent(currentPath)}&msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`
      );
    }

    const safeName = folderName.replace(/[/\\?%*:|"<>]/g, '-');
    const newFolderPath = path.join(PHOTOS_ROOT, currentPath, safeName);

    await fs.mkdir(newFolderPath, { recursive: true });
      const folderDisplay = currentPath ? `/${currentPath}` : '/';
      const msg = encodeURIComponent(`Folder created successfully in ${folderDisplay}`);
      const status = 'success';
        res.redirect(
          `/admin/photos_files?path=${encodeURIComponent(currentPath)}&msg=${msg}&status=${status}`
        );
  } catch (err) {
    console.error(err);

    const msg = 'Error creating folder';
    const status = 'error';

    res.redirect(
      `/admin/photos_files?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`
    );
  }
});
router.post('/delete-selected', requireLogin, async (req, res) => {
  try {
    const { files, folder } = req.body; // get files array and folder
    if (files && files.length) {
      const list = Array.isArray(files) ? files : [files];
      for (const relPath of list) {
        const fullPath = path.join(PHOTOS_ROOT, relPath);
        if (!fullPath.startsWith(PHOTOS_ROOT)) continue;
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
    if (folder) {
      const fullFolder = path.join(PHOTOS_ROOT, folder);

      if (!fullFolder.startsWith(PHOTOS_ROOT)) {
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
router.post('/upload-image', requireLogin, (req, res) => {

  const uploadHandler = upload.array('images', 20);

  uploadHandler(req, res, async function (err) {

    if (err) {
      let msg = 'Upload error';
      const status = 'error';

      if (err.code === 'LIMIT_FILE_SIZE') {
        msg = 'One of the images exceeds 10MB limit.';
      } else if (err.code === 'LIMIT_FILE_COUNT') {
        msg = 'You can upload maximum 20 images at once.';
      } else {
        msg = err.message;
      }

      return res.redirect(`/admin/photos_files?msg=${encodeURIComponent(msg)}&status=${status}`);
    }

    try {
      const currentPath = req.body.currentPath || '';
      const targetFolder = path.join(PHOTOS_ROOT, currentPath);

      if (!targetFolder.startsWith(PHOTOS_ROOT)) {
        return res.redirect(`/admin/photos_files?msg=Access denied&status=error`);
      }

      if (!req.files || req.files.length === 0) {
        return res.redirect(`/admin/photos_files?path=${encodeURIComponent(currentPath)}&msg=No images selected&status=error`);
      }

      const thumbsFolder = path.join(targetFolder, 'thumbs');

      await fs.mkdir(targetFolder, { recursive: true });
      await fs.mkdir(thumbsFolder, { recursive: true });

      for (const file of req.files) {

        const inputPath = file.path;
        const baseName = path.parse(file.originalname).name;

        const fullImagePath = path.join(targetFolder, baseName + '.webp');
        const thumbImagePath = path.join(thumbsFolder, baseName + '.webp');

        const image = sharp(inputPath).rotate();

        // FULL IMAGE
        await image.clone()
          .resize({
            width: 1200,
            height: 1200,
            fit: 'inside',
            withoutEnlargement: true
          })
          .webp({ quality: 75 })
          .toFile(fullImagePath);

        // THUMBNAIL
        await image.clone()
          .resize({
            width: 300,
            height: 300,
            fit: 'inside',
            withoutEnlargement: true
          })
          .webp({ quality: 65 })
          .toFile(thumbImagePath);

        await fs.unlink(inputPath);
      }

      const folderDisplay = currentPath ? `/${currentPath}` : '/';

      res.redirect(
        `/admin/photos_files?path=${encodeURIComponent(currentPath)}&msg=${encodeURIComponent(`Images uploaded successfully to ${folderDisplay}`)}&status=success`
      );

    } catch (error) {
      console.error(error);
      res.redirect(`/admin/photos_files?msg=Error processing images&status=error`);
    }

  });

});
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

    const originalPath = path.join(PHOTOS_ROOT, file);
    const thumbPath = path.join(
      path.dirname(originalPath),
      'thumbs',
      path.basename(originalPath)
    );

    await fs.access(originalPath);

    const tempOriginal = originalPath + '.tmp';
    const tempThumb = thumbPath + '.tmp';

    const image = sharp(originalPath).rotate(angle);

    // FULL IMAGE → write temp
    await image.clone()
      .resize({
        width: 1200,
        height: 1200,
        fit: 'inside',
        withoutEnlargement: true
      })
      //.webp({ quality: 75 })
      .toFile(tempOriginal);

    // THUMB → write temp
    await image.clone()
      .resize({
        width: 300,
        height: 300,
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: 65 })
      .toFile(tempThumb);

    // ATOMIC REPLACE
    await fs.rename(tempOriginal, originalPath);
    await fs.rename(tempThumb, thumbPath);

    return res.json({
      ok: true,
      status: 'success',
      msg: 'Image rotated successfully.'
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      ok: false,
      status: 'error',
      msg: 'Rotation failed'
    });
  }
});
router.post('/rotation-thumbs', requireLogin, async (req, res) => {
  try {
    const { file, angle } = req.body;
    if (!file || typeof angle !== 'number') {
      return res.status(400).json({ error: 'Invalid parameters' });
    }
    const originalPath = path.join(PHOTOS_ROOT, file);
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
