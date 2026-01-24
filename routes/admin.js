const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
// Base folder for events content (correct path)
const EVENTS_ROOT = path.join(__dirname, '..', 'content', 'events');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const currentPath = req.body.currentPath || ''; // get folder from form
    const folderPath = path.join(EVENTS_ROOT, currentPath);

    // Make sure the folder exists
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
function listDirectory(relativePath = '') {
  const safePath = path.normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/, '');
  const fullPath = path.join(EVENTS_ROOT, safePath);

  const items = fs.readdirSync(fullPath, { withFileTypes: true });

  return items.map(item => ({
    name: item.name,
    type: item.isDirectory() ? 'folder' : 'file'
  }));
}

const upload = multer({ storage });

// middleware/auth.js
const requireLogin = require('../middleware/auth');

// All routes for English pages
router.get('/home',  requireLogin, (req, res) => {
  res.render('admin/home', { 
    layout: 'layouts/admin',
    title: 'Home - admin', 
    lang: 'en', 
    page: 'home',
    favicon: '/images/logo-olqa-mini.png' // path to your mini icon
  });
});

router.get('/about',  requireLogin, (req, res) => {
  res.render('admin/about', { 
    layout: 'layouts/admin',
    title: 'About - admin', 
    lang: 'en', 
    page: 'about',
    favicon: '/images/logo-olqa-mini.png'
  });
});

router.get('/masses', requireLogin,(req, res) => {
  res.render('admin/masses', { 
    layout: 'layouts/admin',
    title: 'Masses & Devotions - admin', 
    lang: 'en', 
    page: 'masses',
    favicon: '/images/logo-olqa-mini.png'
  });
});

router.get('/office', requireLogin, (req, res) => {
  res.render('admin/office', { 
    layout: 'layouts/admin',
    title: 'Parish Office - admin', 
    lang: 'en', 
    page: 'office',
    favicon: '/images/logo-olqa-mini.png'
  });
});

router.get('/bulletin', requireLogin, (req, res) => {
  res.render('admin/bulletin', {
    layout: 'layouts/admin', 
    title: 'Bulletin - admin', 
    lang: 'en', 
    page: 'bulletin',
    favicon: '/images/logo-olqa-mini.png'
  });
});

router.get('/groups', requireLogin, (req, res) => {
  res.render('admin/groups', { 
    layout: 'layouts/admin',
    title: 'Parish Groups - admin', 
    lang: 'en', 
    page: 'groups',
    favicon: '/images/logo-olqa-mini.png'
  });
});

router.get('/communities', requireLogin, (req, res) => {
  res.render('admin/communities', { 
    layout: 'layouts/admin',
    title: 'Chapels & Communities - admin', 
    lang: 'en', 
    page: 'communities',
    favicon: '/images/logo-olqa-mini.png'
  });
});

router.get('/homilies', requireLogin, (req, res) => {
  res.render('admin/homilies', { 
    layout: 'layouts/admin',
    title: 'Homilies - admin', 
    lang: 'en', 
    page: 'homilies',
    favicon: '/images/logo-olqa-mini.png'
  });
});

router.get('/events', requireLogin, (req, res) => {
  const currentPath = req.query.path || '';  // ✅ define first
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
    breadcrumbs
  });
});

router.get('/contact', requireLogin, (req, res) => {
  res.render('admin/contact', { 
    layout: 'layouts/admin',
    title: 'Contact Us - admin', 
    lang: 'en', 
    page: 'contact',
    favicon: '/images/logo-olqa-mini.png'
  });
});

router.post('/events/upload-image', requireLogin, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.send('No file uploaded');
  }

  const folder = req.body.currentPath || '';
  // Redirect back to the current folder after upload
  res.redirect(`/admin/events?path=${encodeURIComponent(folder)}`);
});

router.post('/events/create-folder', requireLogin, (req, res) => {
  const currentPath = req.body.currentPath || '';
  const folderName = req.body.folderName;

  if (!folderName) {
    return res.send('Folder name is required');
  }

  // Sanitize folder name (remove dangerous characters)
  const safeName = folderName.replace(/[/\\?%*:|"<>]/g, '-');

  const newFolderPath = path.join(EVENTS_ROOT, currentPath, safeName);

  if (!fs.existsSync(newFolderPath)) {
    fs.mkdirSync(newFolderPath, { recursive: true });
  }

  // Redirect back to the current folder after creating
  res.redirect(`/admin/events?path=${encodeURIComponent(currentPath)}`);
});

module.exports = router;
