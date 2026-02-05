const express = require('express');
const router = express.Router();
const fs = require('fs/promises');
const path = require('path');
const multer = require('multer');

const readDir = require(path.join(APP_ROOT, 'helpers', 'readDir'));
const transformDirList = require(path.join(APP_ROOT, 'helpers', 'transformDirList'));
const storeDirInTree = require(path.join(APP_ROOT, 'helpers', 'storeDirInTree'));
const requireLogin = require(path.join(APP_ROOT, 'middleware', 'auth'));

/* ============================================================
   CONFIG
============================================================ */
const EVENTS_ROOT = path.join(APP_ROOT, 'content/homilies');

let tree = {};

/* ============================================================
   MULTER (HTML only, memory)
============================================================ */
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(html?|htm)$/i)) {
      return cb(new Error('Only HTML files are allowed'));
    }
    cb(null, true);
  }
});

/* ============================================================
   HELPERS
============================================================ */
function getNode(obj, pathStr) {
  if (!pathStr) return obj;
  return pathStr.split('/').reduce((cur, key) => cur?.[key], obj);
}
async function setHiddenFlag(filePath, hidden) {
  const metaPath = filePath + '.meta.json';
  const data = JSON.stringify({ hidden }, null, 2);

  await fs.writeFile(metaPath, data, 'utf8');
}

/* ============================================================
   ROUTES
============================================================ */

// Admin homilies page
router.get('/', requireLogin, (req, res) => {
  tree = {};
  res.render('pages/admin/homilies', {
    layout: 'layouts/admin',
    title: 'Homilies - admin',
    lang: 'en',
    page: 'homilies',
    favicon: '/images/logo-olqa-mini.png'
  });
});

// List directories (AJAX)
router.get('/ls', requireLogin, async (req, res) => {
  try {
    const relativePath = req.query.path || '';
    const content = transformDirList(
      await readDir(EVENTS_ROOT, relativePath)
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
    const currentPath = req.body.currentPath || '';
    const folderName = req.body.folderName;
    if (!folderName) return res.status(400).send('Folder name is required');

    const safeName = folderName.replace(/[/\\?%*:|"<>]/g, '-');
    const newFolderPath = path.join(EVENTS_ROOT, currentPath, safeName);

    await fs.mkdir(newFolderPath, { recursive: true });
    res.redirect(`/admin/homilies?path=${encodeURIComponent(currentPath)}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error while creating folder');
  }
});
router.post('/create-html', requireLogin, async (req, res) => {
  try {
    const currentPath = req.body.currentPath || '';
    let fileName = req.body.fileName;

    if (!fileName) {
      return res.status(400).send('File name is required');
    }

    // sanitize
    fileName = fileName.replace(/[/\\?%*:|"<>]/g, '-');

    // enforce .html extension
    if (!fileName.endsWith('.html')) {
      fileName += '.html';
    }

    const filePath = path.join(EVENTS_ROOT, currentPath, fileName);

    // prevent overwrite
    try {
      await fs.access(filePath);
      return res.status(409).send('File already exists');
    } catch {
      // file does not exist → OK
    }

    // minimal HTML skeleton
    const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${fileName.replace('.html', '')}</title>
</head>
<body>

</body>
</html>`;

  const _draftPath = '_draft-'+filePath;
   await fs.writeFile(_draftPath, htmlTemplate, 'utf8');
  // mark as hidden (however you store it)
    //await setHiddenFlag(filePath, true);
    res.redirect(`/admin/homilies?path=${encodeURIComponent(currentPath)}`);

  } catch (err) {
    console.error(err);
    res.status(500).send('Server error while creating HTML file');
  }
});

// Delete folder/file
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


// 📄 Upload / load HTML file
router.post('/upload-file', requireLogin, upload.single('html'), async (req, res) => {
  try {
    const currentPath = req.body.currentPath || '';
    const targetDir = path.join(EVENTS_ROOT, currentPath);

    if (!targetDir.startsWith(EVENTS_ROOT)) return res.status(403).send('Access denied');
    if (!req.file) return res.status(400).send('No HTML uploaded');

    await fs.mkdir(targetDir, { recursive: true });
    const originalName = req.file.originalname;
    await fs.writeFile(path.join(targetDir, originalName), req.file.buffer);

    res.redirect(`/admin/homilies?path=${encodeURIComponent(currentPath)}`);
  } catch (err) {
    console.error(err);
    res.status(400).send(err.message);
  }
});
// Express route
router.get('/file', async (req, res) => {
   const currentPath = req.query.path || '';
   console.log('Requested file path:', currentPath);
  //const filePath = req.query.path; // path relative to content/homilies
  if (!currentPath) return res.status(400).json({ error: 'Missing path' });

  const fullPath = path.resolve(EVENTS_ROOT, currentPath);
  console.log('Resolved full path:', fullPath);
  if (!fullPath.startsWith(EVENTS_ROOT)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const content = await fs.readFile(fullPath, 'utf8');
    res.json({ path: currentPath, content });
  } catch (err) {
    res.status(404).json({ error: 'File not found' });
  }
});

/* ============================================================
   EXPORT
============================================================ */
module.exports = router;
