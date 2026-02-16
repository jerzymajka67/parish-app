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
// Path to favicon
const faviconPath = '/images/logo-olqa-mini.png';

// HOME
router.get('/inicio', (req, res) => {
  res.render('pages/user/es/inicio', { 
    title: 'Inicio - Nuestra Señora Reyna de Los Ángeles', 
    lang: 'es', 
    page: 'home', 
    favicon: faviconPath
  });
});

// ABOUT
router.get('/sobre', (req, res) => {
  res.render('pages/user/es/sobre', { 
    title: 'Sobre la Parroquia - Nuestra Señora Reyna de Los Ángeles', 
    lang: 'es', 
    page: 'about', 
    favicon: faviconPath
  });
});

// MASSES & DEVOTIONS
router.get('/misas', (req, res) => {
  res.render('pages/user/es/misas', { 
    title: 'Misas y Devociones - Nuestra Señora Reyna de Los Ángeles', 
    lang: 'es', 
    page: 'masses', 
    favicon: faviconPath
  });
});

// PARISH OFFICE
router.get('/oficina', (req, res) => {
  res.render('pages/user/es/oficina', { 
    title: 'Oficina Parroquial - Nuestra Señora Reyna de Los Ángeles', 
    lang: 'es', 
    page: 'office', 
    favicon: faviconPath
  });
});

// BULLETIN
router.get('/boletin', (req, res) => {
  res.render('pages/user/es/boletin', { 
    title: 'Boletín Parroquial - Nuestra Señora Reyna de Los Ángeles', 
    lang: 'es', 
    page: 'bulletin', 
    favicon: faviconPath
  });
});

// PARISH GROUPS
router.get('/grupos', (req, res) => {
  res.render('pages/user/es/grupos', { 
    title: 'Grupos Parroquiales - Nuestra Señora Reyna de Los Ángeles', 
    lang: 'es', 
    page: 'groups', 
    favicon: faviconPath
  });
});

// CHAPELS & COMMUNITIES
router.get('/comunidades', (req, res) => {
  res.render('pages/user/es/comunidades', { 
    title: 'Capillas y Comunidades - Nuestra Señora Reyna de Los Ángeles', 
    lang: 'es', 
    page: 'communities', 
    favicon: faviconPath
  });
});

// HOMILIES
router.get('/homilias', (req, res) => {
  res.render('pages/user/es/homilias', { 
    title: 'Homilías - Nuestra Señora Reyna de Los Ángeles', 
    lang: 'es', 
    page: 'homilies', 
    favicon: faviconPath
  });
});

// EVENTS
router.get('/eventos', (req, res) => {
  res.render('pages/user/es/eventos', { 
    title: 'Eventos Parroquiales - Nuestra Señora Reyna de Los Ángeles', 
    lang: 'es', 
    page: 'events', 
    favicon: faviconPath
  });
});
router.get('/events/ls',  async (req, res) => {
   try {
    const relativePath = req.query.path || '';
    const content = transformDirList(await readDir(EVENTS_ROOT, relativePath));
    storeDirInTree(tree, relativePath, content);
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
// CONTACT
router.get('/contacto', (req, res) => {
  res.render('pages/user/es/contacto', { 
    title: 'Contacto - Nuestra Señora Reyna de Los Ángeles', 
    lang: 'es', 
    page: 'contact', 
    favicon: faviconPath
  });
});

module.exports = router;
