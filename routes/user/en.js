const express = require('express');
const router = express.Router();
const fs = require('fs/promises');
const path = require('path');
const readDir = require(path.join(APP_ROOT, 'helpers', 'readDir'));
const PHOTOS_ROOT = path.join(APP_ROOT, 'content/photos_files');
const BULLETIN_ROOT = path.join(APP_ROOT, 'content/bulletin_files/en');
const HOMILIIES_ROOT = path.join(APP_ROOT, 'content/homilies_files/en');
const transformDirList = require(path.join(APP_ROOT, 'helpers', 'transformDirList'));
const storeDirInTree = require(path.join(APP_ROOT, 'helpers', 'storeDirInTree'));
function getNode(obj, pathStr) {
  if (!pathStr) return obj;
  return pathStr.split('/').reduce((cur, key) => cur?.[key], obj);
}
let tree = {};
// All routes for English pages
router.get('/', (req, res) => {
  res.render('pages/user/en/home', { 
    layout: 'layouts/user',
    title: 'Home - Our Lady, Queen of Angels', 
    lang: 'en', 
    page: 'home',
    favicon: '/images/logo-olqa-mini.png' // path to your mini icon
  });
});
router.get('/home', (req, res) => {
  res.render('pages/user/en/home', { 
    layout: 'layouts/user',
    title: 'Home - Our Lady, Queen of Angels', 
    lang: 'en', 
    page: 'home',
    favicon: '/images/logo-olqa-mini.png' // path to your mini icon
  });
});
router.get('/about', (req, res) => {
  res.render('pages/user/en/about', { 
    layout: 'layouts/user',
    title: 'About - Our Lady, Queen of Angels', 
    lang: 'en', 
    page: 'about',
    favicon: '/images/logo-olqa-mini.png'
  });
});
router.get('/masses', (req, res) => {
  res.render('pages/user/en/masses', { 
    layout: 'layouts/user',
    title: 'Masses & Devotions - Our Lady, Queen of Angels', 
    lang: 'en', 
    page: 'masses',
    favicon: '/images/logo-olqa-mini.png'
  });
});
router.get('/office', (req, res) => {
  res.render('pages/user/en/office', { 
    layout: 'layouts/user',
    title: 'Parish Office - Our Lady, Queen of Angels', 
    lang: 'en', 
    page: 'office',
    favicon: '/images/logo-olqa-mini.png'
  });
});
router.get('/bulletin', (req, res) => {
  tree = {};
  res.render('pages/user/en/bulletin', { 
    layout: 'layouts/user',
    title: 'Bulletin - Our Lady, Queen of Angels', 
    lang: 'en', 
    page: 'bulletin',
    favicon: '/images/logo-olqa-mini.png'
  });
});
router.get('/bulletin/ls',  async (req, res) => {
   try {
    const relativePath = req.query.path || '';
    const content = transformDirList(await readDir(BULLETIN_ROOT, relativePath));
    storeDirInTree(tree, relativePath, content);
    res.json(getNode(tree, relativePath));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get('/groups', (req, res) => {
  res.render('pages/user/en/groups', { 
    layout: 'layouts/user',
    title: 'Parish Groups - Our Lady, Queen of Angels', 
    lang: 'en', 
    page: 'groups',
    favicon: '/images/logo-olqa-mini.png'
  });
});
router.get('/communities', (req, res) => {
  res.render('pages/user/en/communities', { 
    layout: 'layouts/user',
    title: 'Chapels & Communities - Our Lady, Queen of Angels', 
    lang: 'en', 
    page: 'communities',
    favicon: '/images/logo-olqa-mini.png'
  });
});
router.get('/homilies', (req, res) => {
  tree = {};
  res.render('pages/user/en/homilies', {
    layout: 'layouts/user',
    title: 'Homilies (English)',
    lang: 'en', 
    page: 'homilies',
    favicon: '/images/logo-olqa-mini.png'
  });
});
router.get('/homilies/ls',  async (req, res) => {
   try {
    const relativePath = req.query.path || '';
    const content = transformDirList(await readDir(HOMILIIES_ROOT, relativePath));
    storeDirInTree(tree, relativePath, content);
    res.json(getNode(tree, relativePath));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get('/events', (req, res) => {
  res.render('pages/user/en/events', { 
    layout: 'layouts/user',
    title: 'Events - Our Lady, Queen of Angels', 
    lang: 'en', 
    page: 'events',
    favicon: '/images/logo-olqa-mini.png'
  });
});
router.get('/photos', (req, res) => {
  tree = {};
  res.render('pages/user/en/photos', { 
    layout: 'layouts/user',
    title: 'Parish Photos - Our Lady, Queen of Angels', 
    lang: 'en', 
    page: 'photos',
    favicon: '/images/logo-olqa-mini.png'
  });
});
router.get('/photos/ls',  async (req, res) => {
   try {
    const relativePath = req.query.path || '';
    const content = transformDirList(await readDir(PHOTOS_ROOT, relativePath));
    storeDirInTree(tree, relativePath, content);
    res.json(getNode(tree, relativePath));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get('/photos/thumbs', async (req, res) => {
  const relPath = req.query.path;
  if (!relPath) {
    return res.json({ isGallery: false, thumbs: [] });
  }
  const thumbsDir = path.join(
    APP_ROOT,
    'content',
    'photos',
    relPath,
    'thumbs'
  );
  try {
    const files = await fs.readdir(thumbsDir);
    const thumbs = files.filter(f =>
      f.toLowerCase().endsWith('.webp')
    );
    res.json({
      isGallery: thumbs.length > 0,
      thumbs
    });
  } catch (err) {
    // thumbs/ does not exist → NOT a gallery
    res.json({ isGallery: false, thumbs: [] });
  }
});
router.get('/contact', (req, res) => {
  res.render('pages/user/en/contact', { 
    layout: 'layouts/user',
    title: 'Contact Us - Our Lady, Queen of Angels', 
    lang: 'en', 
    page: 'contact',
    favicon: '/images/logo-olqa-mini.png'
  });
});

module.exports = router;
