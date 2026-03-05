const express = require('express');
const router = express.Router();
const fs = require('fs/promises');
const path = require('path');
const readDir = require(path.join(APP_ROOT, 'helpers', 'readDir'));
const EVENTS_ROOT = path.join(APP_ROOT, 'content/events');
const BULLETIN_ROOT = path.join(APP_ROOT, 'content/bulletin/es')
const HOMILIIES_ROOT = path.join(APP_ROOT, 'content/homilies/es');
const transformDirList = require(path.join(APP_ROOT, 'helpers', 'transformDirList'));
const storeDirInTree = require(path.join(APP_ROOT, 'helpers', 'storeDirInTree'));
function getNode(obj, pathStr) {
  if (!pathStr) return obj;
  return pathStr.split('/').reduce((cur, key) => cur?.[key], obj);
}
let tree = {};
const faviconPath = '/images/logo-olqa-mini.png';
router.get('/inicio', (req, res) => {
  res.render('pages/user/es/inicio', { 
    layout: 'layouts/user',
    title: 'Inicio - Nuestra Señora Reyna de Los Ángeles', 
    lang: 'es', 
    page: 'home', 
    favicon: faviconPath
  });
});
router.get('/sobre', (req, res) => {
  res.render('pages/user/es/sobre', { 
    layout: 'layouts/user',
    title: 'Sobre la Parroquia - Nuestra Señora Reyna de Los Ángeles', 
    lang: 'es', 
    page: 'about', 
    favicon: faviconPath
  });
});
router.get('/misas', (req, res) => {
  res.render('pages/user/es/misas', { 
    layout: 'layouts/user',
    title: 'Misas y Devociones - Nuestra Señora Reyna de Los Ángeles', 
    lang: 'es', 
    page: 'masses', 
    favicon: faviconPath
  });
});
router.get('/oficina', (req, res) => {
  res.render('pages/user/es/oficina', { 
    layout: 'layouts/user',
    title: 'Oficina Parroquial - Nuestra Señora Reyna de Los Ángeles', 
    lang: 'es', 
    page: 'office', 
    favicon: faviconPath
  });
});
router.get('/boletin', (req, res) => {
  tree = {};
  res.render('pages/user/es/boletin', {
    layout: 'layouts/user', 
    title: 'Boletín Parroquial - Nuestra Señora Reyna de Los Ángeles', 
    lang: 'es', 
    page: 'bulletin', 
    favicon: faviconPath
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
router.get('/grupos', (req, res) => {
  res.render('pages/user/es/grupos', { 
    layout: 'layouts/user',
    title: 'Grupos Parroquiales - Nuestra Señora Reyna de Los Ángeles', 
    lang: 'es', 
    page: 'groups', 
    favicon: faviconPath
  });
});
router.get('/comunidades', (req, res) => {
  res.render('pages/user/es/comunidades', { 
    layout: 'layouts/user',
    title: 'Capillas y Comunidades - Nuestra Señora Reyna de Los Ángeles', 
    lang: 'es', 
    page: 'communities', 
    favicon: faviconPath
  });
});
router.get('/homilias', (req, res) => {
  tree = {};
  res.render('pages/user/es/homilias', {
    layout: 'layouts/user',
    title: 'Homilies (Spanish)',
    lang: 'es', 
    page: 'homilies', 
    favicon: faviconPath    
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
router.get('/eventos', (req, res) => {
  res.render('pages/user/es/eventos', { 
    layout: 'layouts/user',
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
router.get('/contacto', (req, res) => {
  res.render('pages/user/es/contacto', { 
    layout: 'layouts/user',
    title: 'Contacto - Nuestra Señora Reyna de Los Ángeles', 
    lang: 'es', 
    page: 'contact', 
    favicon: faviconPath
  });
});

module.exports = router;
