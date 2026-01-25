const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
// Base folder for events content (correct path)
const EVENTS_ROOT = path.join(__dirname, '..', 'content', 'events');
const tmpFolder = path.join(EVENTS_ROOT, 'tmp');
if (!fs.existsSync(tmpFolder)) {
  fs.mkdirSync(tmpFolder, { recursive: true });
}
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
function listDirectory(currentPath) {
  const fullPath = path.join(EVENTS_ROOT, currentPath);
  const items = [];

  fs.readdirSync(fullPath, { withFileTypes: true }).forEach(dirent => {
    // Skip tmp folder
    if (dirent.name === 'tmp') return;

    if (dirent.isDirectory()) {
      items.push({ name: dirent.name, type: 'folder' });
    } else {
      items.push({ name: dirent.name, type: 'file' });
    }
  });

  return items;
}


const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // max 5 MB
});


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

router.post('/events/upload-image', requireLogin, upload.single('image'), async (req, res) => {
  try {
    const currentPath = req.body.currentPath || '';
    const targetFolder = path.join(EVENTS_ROOT, currentPath);

    if (!req.file) {
      return res.send('No file uploaded');
    }

    // Create target folder if it does not exist
    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder, { recursive: true });
    }

    const inputPath = req.file.path; // temp file
    const filenameWithoutExt = path.parse(req.file.originalname).name;
    const outputPath = path.join(targetFolder, filenameWithoutExt + '.webp');

    // Resize + convert to WebP
    await sharp(inputPath)
      .resize({ width: 1200 })      // max width
      .webp({ quality: 80 })        // ~200KB typical
      .toFile(outputPath);

    // Delete temporary file
    fs.unlinkSync(inputPath);

    // Redirect back to the current folder
    res.redirect(`/admin/events?path=${encodeURIComponent(currentPath)}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error processing image');
  }
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
router.get('/events/view', requireLogin, (req, res) => {
  const filePath = req.query.file;
  if (!filePath) return res.sendStatus(400);

  const absolutePath = path.join(EVENTS_ROOT, filePath);

  // Security: prevent path traversal
  if (!absolutePath.startsWith(EVENTS_ROOT)) {
    return res.sendStatus(403);
  }

  res.sendFile(absolutePath);
});
// Delete selected files and folders
router.post('/events/delete-selected', requireLogin, (req, res) => {
  const { selected = [], currentPath = '' } = req.body;

  const items = Array.isArray(selected) ? selected : [selected];

  items.forEach(entry => {
    const [type, relativePath] = entry.split(':');

    if (!type || !relativePath) return;

    const targetPath = path.join(EVENTS_ROOT, relativePath);

    if (!fs.existsSync(targetPath)) return;

    if (type === 'folder') {
      fs.rmSync(targetPath, { recursive: true, force: true });
    } else if (type === 'file') {
      fs.unlinkSync(targetPath);
    }
  });

  res.redirect(`/admin/events?path=${encodeURIComponent(currentPath)}`);
});


module.exports = router;
