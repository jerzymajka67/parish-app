const express = require('express');
const router = express.Router();
const fs = require('fs/promises');
const path = require('path');
const multer = require('multer');
const HOMILIES_ROOT = path.join(APP_ROOT, 'content/homilies');
const readDir = require(path.join(APP_ROOT, 'helpers', 'readDir'));
const transformDirList = require(path.join(APP_ROOT, 'helpers', 'transformDirList'));
const storeDirInTree = require(path.join(APP_ROOT, 'helpers', 'storeDirInTree'));
const requireLogin = require(path.join(APP_ROOT, 'middleware', 'auth'));
let tree = {};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(html?|htm)$/i)) {
      return cb(new Error('Only HTML files are allowed'));
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
  res.render('pages/admin/homilies', {
    layout: 'layouts/admin',
    title: 'Homilies - admin',
    lang: 'en',
    page: 'homilies',
    favicon: '/images/logo-olqa-mini.png',
    msg: req.query.msg || null,
    status: req.query.status || null
  });
});
router.get('/ls', requireLogin, async (req, res) => {
  try {
    const relativePath = req.query.path || '';
    const content = transformDirList(
      await readDir(HOMILIES_ROOT, relativePath)
    );
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
    if (!folderName) return res.status(400).send('Folder name is required');
    const safeName = folderName.replace(/[/\\?%*:|"<>]/g, '-');
    const newFolderPath = path.join(HOMILIES_ROOT, currentPath, safeName);
    await fs.mkdir(newFolderPath, { recursive: true });
    res.redirect(`/admin/homilies?path=${encodeURIComponent(currentPath)}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error while creating folder');
  }
});
router.post('/create-html', requireLogin, async (req, res) => {
   let fileName = req.body.fileName;
   let currentPath = req.body.currentPath || '';
   console.log('Creating HTML file:', fileName, 'in path:', currentPath);
    try {
      if (!fileName) {
      const msg = 'File name is required';
      const status = 'error';
       return res.redirect(`/admin/homilies?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`);
    }
    if (!fileName.endsWith('.html')) {
      fileName += '.html';
    }
    const filePath = path.join(HOMILIES_ROOT, currentPath, fileName);
    try {
      await fs.access(filePath);
      const msg = 'File already exists';
      const status = 'error';
      return res.redirect(`/admin/homilies?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`);
    } catch {
      // file does not exist → OK
    }

    const htmlTemplate = `<!DOCTYPE html>
<body> </body>`;
   await fs.writeFile(filePath, htmlTemplate, 'utf8');
      const msg = `File ${fileName} created successfully in ${currentPath || 'root'}`;
      const status = 'success';
      return res.redirect(`/admin/homilies?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`);
    } catch (err) {
      const msg = `Server error while creating HTML file ${fileName} - ${err.message}`;
      const status = 'error';
      return res.redirect(`/admin/homilies?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`);
  }
});
router.post('/delete-selected', requireLogin, async (req, res) => {
  let messageType = 'error';
  let msg = '';
  try {
    const folder = req.body.folder;
    const files = JSON.parse(req.body.files || '[]');
  for (const file of files) {
  const filePath = path.join(HOMILIES_ROOT, file);
  await fs.rm(filePath, { force: true });
   msg += `Deleted file: ${file}\n`;
}
if (folder) {
  const folderPath = path.join(HOMILIES_ROOT, folder);
  await fs.rm(folderPath, { recursive: true, force: true });
  msg += `Deleted folder: ${folder}\n`;
}
    messageType = 'success';
  } catch (err) {
    console.error(err);
    msg = err.message || 'Server error';
    res.redirect(`/admin/homilies?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(messageType)}`);
  }
  res.redirect(`/admin/homilies?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(messageType)}`);
});
router.post('/load-file', requireLogin, upload.single('html'), async (req, res) => {
  try {
    const currentPath = req.body.currentPath || '';
    const targetDir = path.join(HOMILIES_ROOT, currentPath);
    if (!targetDir.startsWith(HOMILIES_ROOT)) {
      return res.status(403).send('Access denied');
    }
    if (!req.file) {
      const msg = 'No HTML uploaded';
      const status = 'error';
      return res.redirect(`/admin/homilies?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`);
    }
    const safeName = req.file.originalname.replace(/[/\\?%*:|"<>]/g, '-');
    await fs.mkdir(targetDir, { recursive: true });
    await fs.writeFile(path.join(targetDir, safeName), req.file.buffer);
    const msg = `HTML "${safeName}" uploaded successfully to "${targetDir || 'root'}"`;
    const status = 'success';
    res.redirect(`/admin/homilies?path=${encodeURIComponent(currentPath)}&msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`);
  } catch (err) {
    const msg = err.message || 'Upload failed';
    const status = 'error';
    res.redirect(`/admin/homilies?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`);
  }
});
router.get('/edit', requireLogin, async (req, res) => {
  const originalFile = req.query.fileName;
  const draftFile = stampFileName(originalFile);
  console.log('Editing file:', originalFile, 'Draft file:', draftFile);
  if (!originalFile) {
    return res.redirect('/admin/homilies?msg=File+name+required&status=error');
  }
  const filePath = path.join(HOMILIES_ROOT, originalFile);
  const backupPath = path.join(HOMILIES_ROOT, draftFile);
  console.log('File path:', filePath);
  console.log('Backup path:', backupPath);
  try {
    await fs.copyFile(filePath, backupPath);
    const content = await fs.readFile(backupPath, 'utf8');
    return res.json({
      draftFile,
      originalFile,
      content
    });
  } catch (err) {
    console.error(err);
    return res.redirect('/admin/homilies?msg=File+error&status=error');
  }
});
router.post('/save', requireLogin, async (req, res) => {
  console.log('Saving file:', req.body);
  const { draftFile, content } = req.body;
  if (!draftFile || content === undefined) {
    return res.redirect('/admin/homilies?msg=Invalid+data&status=error');
  }

  try {
    await fs.writeFile(
      path.join(HOMILIES_ROOT, draftFile),
      content,
      'utf8'
    );

    return res.status(204).end();
  } catch (err) {
    console.error(err);
    return res.redirect('/admin/homilies?msg=Save+failed&status=error');
  }
});
router.post('/save-exit', requireLogin, async (req, res) => {
  const { draftFile, originalFile, content } = req.body;

  if (!draftFile || !originalFile || content === undefined) {
    const msg = 'File name and content are required';
    const status = 'error';
    return res.redirect(
      `/admin/homilies?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`
    );
  }

  const filePath = path.join(HOMILIES_ROOT, draftFile);

  try {
    await fs.writeFile(filePath, content, 'utf8');

    const msg =
      `New version of original file "${originalFile}" is now in "${draftFile}" and ready to be published. ` +
      `Please review it and publish when ready.`;
    const status = 'success';
    return res.redirect(
      `/admin/homilies?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`
    );
  } catch (err) {
    console.error(err);
    const msg = 'Failed to save file';
    const status = 'error';
    return res.redirect(
      `/admin/homilies?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`
    );
  }
});
module.exports = router;
