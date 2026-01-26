const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
// Base folder for events content
const EVENTS_ROOT = path.join(__dirname, '..', 'content', 'events');
const tmpFolder = path.join(EVENTS_ROOT, 'tmp');
if (!fs.existsSync(tmpFolder)) {
  fs.mkdirSync(tmpFolder, { recursive: true });
}
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

function buildBreadcrumbs(currentPath) {
  if (!currentPath) return [];
  const parts = currentPath.split('/');
  let accumulated = '';
  return parts.map(part => {
    accumulated = accumulated ? accumulated + '/' + part : part;
    return {
      name: part,
      path: accumulated
    };
  });
}

function listDirectory(currentPath) {
  const fullPath = path.join(EVENTS_ROOT, currentPath);
  const items = [];

  try {
    fs.readdirSync(fullPath, { withFileTypes: true }).forEach(dirent => {
      if (dirent.name === 'tmp') return;
      if (dirent.isDirectory()) {
        items.push({ name: dirent.name, type: 'folder' });
      } else {
        items.push({ name: dirent.name, type: 'file' });
      }
    });
  } catch (err) {
    // If directory doesn't exist or can't be read, return empty
  }

  // Sort: folders first
  items.sort((a, b) => {
    if (a.type === 'folder' && b.type !== 'folder') return -1;
    if (a.type !== 'folder' && b.type === 'folder') return 1;
    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
  });

  return items;
}

// -----------------------------
// NEW: Build HTML tree helper
// -----------------------------
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * buildTreeHTML(relativePath, depth = 0)
 * - relativePath: path relative to EVENTS_ROOT
 * - depth: current recursion depth (internal). A maxDepth is used to avoid deep recursion.
 *
 * Returns HTML string (safe-escaped) representing a nested <ul> tree.
 *
 * NOTE: The returned HTML is intended to be rendered unescaped in EJS with <%- ... %>
 */
function buildTreeHTML(relativePath = '', depth = 0) {
  const MAX_DEPTH = 6; // adjust if you expect deeper trees
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

  // filter and sort
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
// -----------------------------
// END tree helper
// -----------------------------

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // max 5 MB
});

// middleware/auth.js
const requireLogin = require('../middleware/auth');

// All admin routes (kept existing behavior; add buildTreeHTML to /events render)
router.get('/home',  requireLogin, (req, res) => {
  res.render('admin/home', { 
    layout: 'layouts/admin',
    title: 'Home - admin', 
    lang: 'en', 
    page: 'home',
    favicon: '/images/logo-olqa-mini.png'
  });
});

// ... (other routes unchanged) ...

router.get('/events', requireLogin, (req, res) => {
  const currentPath = req.query.path || '';
  const items = listDirectory(currentPath);
  const breadcrumbs = buildBreadcrumbs(currentPath);
  // Pass buildTreeHTML into the template context
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

// ... (remaining handlers unchanged) ...

module.exports = router;