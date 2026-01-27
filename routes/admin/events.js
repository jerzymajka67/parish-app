const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

// Base folder for events content (two levels up because this file is routes/admin/events.js)
const EVENTS_ROOT = path.join(__dirname, '..', '..', 'content', 'events');
const tmpFolder = path.join(EVENTS_ROOT, 'tmp');
if (!fs.existsSync(tmpFolder)) {
  fs.mkdirSync(tmpFolder, { recursive: true });
}

// Multer storage: store uploads directly into the selected folder under EVENTS_ROOT
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const currentPath = req.body.currentPath || '';
    const folderPath = path.join(EVENTS_ROOT, currentPath);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    cb(null, folderPath);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Auth middleware
const requireLogin = require('../../middleware/auth');

// Helper: breadcrumbs
function buildBreadcrumbs(currentPath) {
  if (!currentPath) return [];
  const parts = currentPath.split('/');
  let accumulated = '';
  return parts.map(part => {
    accumulated = accumulated ? accumulated + '/' + part : part;
    return { name: part, path: accumulated };
  });
}

// Helper: list directory (non-recursive)
function listDirectory(currentPath) {
  const fullPath = path.join(EVENTS_ROOT, currentPath);
  const items = [];
  try {
    fs.readdirSync(fullPath, { withFileTypes: true }).forEach(dirent => {
      if (dirent.name === 'tmp') return;
      if (dirent.isDirectory()) items.push({ name: dirent.name, type: 'folder' });
      else items.push({ name: dirent.name, type: 'file' });
    });
  } catch (err) {
    // folder missing or unreadable => return empty list
  }
  items.sort((a, b) => {
    if (a.type === 'folder' && b.type !== 'folder') return -1;
    if (a.type !== 'folder' && b.type === 'folder') return 1;
    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
  });
  return items;
}

// Helper: safe HTML tree builder
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
function buildTreeHTML(relativePath = '', depth = 0) {
  const MAX_DEPTH = 6;
  const fullPath = path.join(EVENTS_ROOT, relativePath);
  let html = '<ul class="tree-list">';
  if (depth > MAX_DEPTH) {
    html += '<li class="depth-limit">…</li></ul>';
    return html;
  }
  let dirents = [];
  try {
    dirents = fs.readdirSync(fullPath, { withFileTypes: true });
  } catch (err) {
    html += '<li class="error">Unable to read folder</li></ul>';
    return html;
  }
  dirents = dirents.filter(d => d.name !== 'tmp');
  dirents.sort((a, b) => {
    if (a.isDirectory() && !b.isDirectory()) return -1;
    if (!a.isDirectory() && b.isDirectory()) return 1;
    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
  });
  dirents.forEach(dirent => {
    const name = dirent.name;
    const relPosix = relativePath ? `${relativePath}/${name}` : name;
    const escapedName = escapeHtml(name);
    const escapedRel = escapeHtml(relPosix);
    if (dirent.isDirectory()) {
      const childrenHtml = buildTreeHTML(relPosix, depth + 1);
      html += `
        <li class="folder">
          <label class="entry-label">
            <input type="checkbox" name="selected[]" value="${escapedRel}">
            <span class="folder-name">${escapedName}</span>
            <a class="open-link" href="/admin/events?path=${encodeURIComponent(relPosix)}">Open</a>
          </label>
          <div class="children hidden">${childrenHtml}</div>
        </li>`;
    } else {
      const urlSegments = relPosix.split('/').map(encodeURIComponent).join('/');
      const fileUrl = '/content/events/' + urlSegments;
      html += `
        <li class="file">
          <label class="entry-label">
            <input type="checkbox" name="selected[]" value="${escapedRel}">
            <a href="${fileUrl}" target="_blank" rel="noopener noreferrer">${escapedName}</a>
          </label>
        </li>`;
    }
  });
  html += '</ul>';
  return html;
}

// Routes (mounted at /admin/events)

// GET /admin/events
router.get('/', requireLogin, (req, res) => {
  const currentPath = req.query.path || '';
  const items = listDirectory(currentPath);
  const breadcrumbs = buildBreadcrumbs(currentPath);
  res.render('admin/events', {
    layout: 'layouts/admin',
    title: 'Parish Events - admin',
    lang: 'en',
    page: 'events',
    favicon: '/images/logo-olqa-mini.png',
    currentPath,
    items,
    breadcrumbs,
    buildTreeHTML
  });
});

// GET /admin/events/create-folder (shows simple form)
router.get('/create-folder', requireLogin, (req, res) => {
  const currentPath = req.query.path || '';
  res.render('admin/create_folder', {
    layout: 'layouts/admin',
    title: 'Create Folder - admin',
    lang: 'en',
    page: 'events',
    favicon: '/images/logo-olqa-mini.png',
    currentPath
  });
});

// POST /admin/events/create-folder
router.post('/create-folder', requireLogin, (req, res) => {
  const currentPath = req.body.currentPath || '';
  const folderName = req.body.folderName;
  if (!folderName) return res.send('Folder name is required');
  const safeName = folderName.replace(/[/\\?%*:|"<>]/g, '-');
  const newFolderPath = path.join(EVENTS_ROOT, currentPath, safeName);
  if (!fs.existsSync(newFolderPath)) {
    fs.mkdirSync(newFolderPath, { recursive: true });
  }
  res.redirect(`/admin/events?path=${encodeURIComponent(currentPath)}`);
});

// POST /admin/events/upload-image
router.post('/upload-image', requireLogin, upload.single('image'), async (req, res) => {
  try {
    const currentPath = req.body.currentPath || '';
    const targetFolder = path.join(EVENTS_ROOT, currentPath);
    if (!req.file) return res.send('No file uploaded');
    if (!fs.existsSync(targetFolder)) fs.mkdirSync(targetFolder, { recursive: true });
    const inputPath = req.file.path;
    const filenameWithoutExt = path.parse(req.file.originalname).name;
    const outputPath = path.join(targetFolder, filenameWithoutExt + '.webp');
    await sharp(inputPath).resize({ width: 1200 }).webp({ quality: 80 }).toFile(outputPath);
    fs.unlinkSync(inputPath);
    res.redirect(`/admin/events?path=${encodeURIComponent(currentPath)}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error processing image');
  }
});

// POST /admin/events/delete-selected
router.post('/delete-selected', requireLogin, (req, res) => {
  const { selected = [], currentPath = '' } = req.body;
  const items = Array.isArray(selected) ? selected : [selected];
  items.forEach(relativePath => {
    let rel = relativePath;
    if (typeof relativePath === 'string' && relativePath.includes(':')) {
      const parts = relativePath.split(':');
      rel = parts.slice(1).join(':');
    }
    const targetPath = path.join(EVENTS_ROOT, rel);
    if (!fs.existsSync(targetPath)) return;
    try {
      const stat = fs.statSync(targetPath);
      if (stat.isDirectory()) fs.rmSync(targetPath, { recursive: true, force: true });
      else fs.unlinkSync(targetPath);
    } catch (err) {
      console.error('Error deleting', targetPath, err);
    }
  });
  res.redirect(`/admin/events?path=${encodeURIComponent(currentPath)}`);
});

// GET /admin/events/view?file=...
router.get('/view', requireLogin, (req, res) => {
  const filePath = req.query.file;
  if (!filePath) return res.sendStatus(400);
  const absolutePath = path.join(EVENTS_ROOT, filePath);
  if (!absolutePath.startsWith(EVENTS_ROOT)) return res.sendStatus(403);
  res.sendFile(absolutePath);
});

module.exports = router;