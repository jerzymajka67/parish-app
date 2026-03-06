const express = require('express');
const router = express.Router();
const fs = require('fs/promises');
const path = require('path');
const multer = require('multer');
const EVENTS_ROOT = path.join(APP_ROOT, 'content/events_files');
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
  res.render('pages/admin/events_files', {
    layout: 'layouts/admin',
    title: 'events_files - admin',
    lang: 'en',
    page: 'events_files',
    favicon: '/images/logo-olqa-mini.png',
    msg: req.query.msg || null,
    status: req.query.status || null
  });
});
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
router.post('/create-folder', requireLogin, async (req, res) => {
  try {
    const currentPath = req.body.currentPath || '';
    const folderName = req.body.folderName;
    if (!folderName) return res.status(400).send('Folder name is required');
    const safeName = folderName.replace(/[/\\?%*:|"<>]/g, '-');
    const newFolderPath = path.join(EVENTS_ROOT, currentPath, safeName);
    await fs.mkdir(newFolderPath, { recursive: true });
    res.redirect(`/admin/events_files?path=${encodeURIComponent(currentPath)}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error while creating folder');
  }
});
router.post('/create-html', requireLogin, async (req, res) => {
   let fileName = req.body.fileName;
   let currentPath = req.body.currentPath || '';
    try {
      if (!fileName) {
      const msg = 'File name is required';
      const status = 'error';
       return res.redirect(`/admin/events_files?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`);
    }
    if (!fileName.endsWith('.html')) {
      fileName += '.html';
    }
    const filePath = path.join(EVENTS_ROOT, currentPath, fileName);
    try {
      await fs.access(filePath);
      const msg = 'File already exists';
      const status = 'error';
      return res.redirect(`/admin/events_files?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`);
    } catch {
      // file does not exist → OK
    }

    const htmlTemplate = `<!DOCTYPE html>
<body> </body>`;
   await fs.writeFile(filePath, htmlTemplate, 'utf8');
      const msg = `File ${fileName} created successfully in ${currentPath || 'root'}`;
      const status = 'success';
      return res.redirect(`/admin/events_files?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`);
    } catch (err) {
      const msg = `Server error while creating HTML file ${fileName} - ${err.message}`;
      const status = 'error';
      return res.redirect(`/admin/events_files?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`);
  }
});
router.post('/delete-selected', requireLogin, async (req, res) => {
  let messageType = 'error';
  let msg = '';
  try {
    const folder = req.body.folder;
    const files = JSON.parse(req.body.files || '[]');
  for (const file of files) {
  const filePath = path.join(EVENTS_ROOT, file);
  await fs.rm(filePath, { force: true });
   msg += `Deleted file: ${file}\n`;
}
if (folder) {
  const folderPath = path.join(EVENTS_ROOT, folder);
  await fs.rm(folderPath, { recursive: true, force: true });
  msg += `Deleted folder: ${folder}\n`;
}
    messageType = 'success';
  } catch (err) {
    console.error(err);
    msg = err.message || 'Server error';
    res.redirect(`/admin/events_files?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(messageType)}`);
  }
  res.redirect(`/admin/events_files?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(messageType)}`);
});
router.post('/load-file', requireLogin, upload.single('html'), async (req, res) => {
  try {
    const currentPath = req.body.currentPath || '';
    const targetDir = path.join(EVENTS_ROOT, currentPath);
    if (!targetDir.startsWith(EVENTS_ROOT)) {
      return res.status(403).send('Access denied');
    }
    if (!req.file) {
      const msg = 'No HTML uploaded';
      const status = 'error';
      return res.redirect(`/admin/events_files?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`);
    }
    const safeName = req.file.originalname.replace(/[/\\?%*:|"<>]/g, '-');
    await fs.mkdir(targetDir, { recursive: true });
    await fs.writeFile(path.join(targetDir, safeName), req.file.buffer);
    const msg = `HTML "${safeName}" uploaded successfully to "${targetDir || 'root'}"`;
    const status = 'success';
    res.redirect(`/admin/events_files?path=${encodeURIComponent(currentPath)}&msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`);
  } catch (err) {
    const msg = err.message || 'Upload failed';
    const status = 'error';
    res.redirect(`/admin/events_files?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`);
  }
});
router.get('/edit', requireLogin, async (req, res) => {
  const originalFile = req.query.fileName;
  const draftFile = 'temp.html';
  if (!originalFile) {
    return res.redirect('/admin/events_files?msg=File+name+required&status=error');
  }
  const filePath = path.join(EVENTS_ROOT, originalFile);
  const backupPath = path.join(EVENTS_ROOT, draftFile);
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
    return res.redirect('/admin/events_files?msg=File+error&status=error');
  }
});
router.post('/save', requireLogin, async (req, res) => {
  const { draftFile, content } = req.body;
  if (!draftFile || content === undefined) {
    return res.redirect('/admin/events_files?msg=Invalid+data&status=error');
  }
  try {
    await fs.writeFile(
      path.join(EVENTS_ROOT, draftFile),
      content,
      'utf8'
    );
    return res.status(204).end();
  } catch (err) {
    console.error(err);
    return res.redirect('/admin/events_files?msg=Save+failed&status=error');
  }
});
router.post('/save-exit', requireLogin, async (req, res) => {
  const { draftFile, originalFile, content } = req.body;

  if (!draftFile || !originalFile || content === undefined) {
    const msg = 'File name and content are required';
    const status = 'error';
    return res.redirect(
      `/admin/events_files?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`
    );
  }
  const filePath = path.join(EVENTS_ROOT, originalFile);
  try {
    await fs.writeFile(filePath, content, 'utf8');
    const msg =
      `New version of original file "${originalFile}" saved successfully.`;
    const status = 'success';
    return res.redirect(
      `/admin/events_files?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`
    );
  } catch (err) {
    console.error(err);
    const msg = 'Failed to save file';
    const status = 'error';
    return res.redirect(
      `/admin/events_files?msg=${encodeURIComponent(msg)}&status=${encodeURIComponent(status)}`
    );
  }
});
module.exports = router;
