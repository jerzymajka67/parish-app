const express = require('express');
const router = express.Router();
const fs = require('fs/promises');
const path = require('path');
const readDir = require(path.join(APP_ROOT, 'helpers', 'readDir'));
const EVENTS_ROOT = path.join(APP_ROOT, 'content/events');
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
    title: 'Home - Our Lady, Queen of Angels', 
    lang: 'en', 
    page: 'home',
    favicon: '/images/logo-olqa-mini.png' // path to your mini icon
  });
});
router.get('/home', (req, res) => {
  res.render('pages/user/en/home', { 
    title: 'Home - Our Lady, Queen of Angels', 
    lang: 'en', 
    page: 'home',
    favicon: '/images/logo-olqa-mini.png' // path to your mini icon
  });
});
router.get('/about', (req, res) => {
  res.render('pages/user/en/about', { 
    title: 'About - Our Lady, Queen of Angels', 
    lang: 'en', 
    page: 'about',
    favicon: '/images/logo-olqa-mini.png'
  });
});
router.get('/masses', (req, res) => {
  res.render('pages/user/en/masses', { 
    title: 'Masses & Devotions - Our Lady, Queen of Angels', 
    lang: 'en', 
    page: 'masses',
    favicon: '/images/logo-olqa-mini.png'
  });
});
router.get('/office', (req, res) => {
  res.render('pages/user/en/office', { 
    title: 'Parish Office - Our Lady, Queen of Angels', 
    lang: 'en', 
    page: 'office',
    favicon: '/images/logo-olqa-mini.png'
  });
});
router.get('/bulletin', (req, res) => {
  res.render('pages/user/en/bulletin', { 
    title: 'Bulletin - Our Lady, Queen of Angels', 
    lang: 'en', 
    page: 'bulletin',
    favicon: '/images/logo-olqa-mini.png'
  });
});
router.get('/groups', (req, res) => {
  res.render('pages/user/en/groups', { 
    title: 'Parish Groups - Our Lady, Queen of Angels', 
    lang: 'en', 
    page: 'groups',
    favicon: '/images/logo-olqa-mini.png'
  });
});
router.get('/communities', (req, res) => {
  res.render('pages/user/en/communities', { 
    title: 'Chapels & Communities - Our Lady, Queen of Angels', 
    lang: 'en', 
    page: 'communities',
    favicon: '/images/logo-olqa-mini.png'
  });
});
router.get('/homilies', (req, res) => {
  res.render('pages/user/en/homilies', { 
    title: 'Homilies - Our Lady, Queen of Angels', 
    lang: 'en', 
    page: 'homilies',
    favicon: '/images/logo-olqa-mini.png'
  });
});
router.get('/events', (req, res) => {
  tree = {};
  res.render('pages/user/en/events', { 
    title: 'Parish Events - Our Lady, Queen of Angels', 
    lang: 'en', 
    page: 'events',
    favicon: '/images/logo-olqa-mini.png'
  });
});
router.get('/events/ls',  async (req, res) => {
   try {
    const relativePath = req.query.path || '';
    console.log('Listing directory for path:', req.query.path);
    const fullPath = path.join(EVENTS_ROOT, relativePath);
    console.log('Full path to read:', fullPath);
    const content = transformDirList(await readDir(EVENTS_ROOT, relativePath));
    console.log('Directory content:', content);
    storeDirInTree(tree, relativePath, content);
    console.log('Updated tree:', tree);
    console.log('Returning content for path:', relativePath, getNode(tree, relativePath));
    console.log('relativePath:', relativePath);
    res.json(getNode(tree, relativePath));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get('/events/thumbs', async (req, res) => {

  const relPath = req.query.path;
  if (!relPath) {
    return res.json({ isGallery: false, thumbs: [] });
  }

  const thumbsDir = path.join(
    APP_ROOT,
    'content',
    'events',
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
    title: 'Contact Us - Our Lady, Queen of Angels', 
    lang: 'en', 
    page: 'contact',
    favicon: '/images/logo-olqa-mini.png'
  });
});

module.exports = router;
