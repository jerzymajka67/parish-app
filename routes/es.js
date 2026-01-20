const express = require('express');
const router = express.Router();

// Path to favicon
const faviconPath = '/images/logo-olqa-mini.png';

// HOME
router.get('/inicio', (req, res) => {
  res.render('es/inicio', { 
    title: 'Inicio - Nuestra Señora Reyna de Los Ángeles', 
    lang: 'es', 
    page: 'home', 
    favicon: faviconPath
  });
});

// ABOUT
router.get('/sobre', (req, res) => {
  res.render('es/sobre', { 
    title: 'Sobre la Parroquia - Nuestra Señora Reyna de Los Ángeles', 
    lang: 'es', 
    page: 'about', 
    favicon: faviconPath
  });
});

// MASSES & DEVOTIONS
router.get('/misas', (req, res) => {
  res.render('es/misas', { 
    title: 'Misas y Devociones - Nuestra Señora Reyna de Los Ángeles', 
    lang: 'es', 
    page: 'masses', 
    favicon: faviconPath
  });
});

// PARISH OFFICE
router.get('/oficina', (req, res) => {
  res.render('es/oficina', { 
    title: 'Oficina Parroquial - Nuestra Señora Reyna de Los Ángeles', 
    lang: 'es', 
    page: 'office', 
    favicon: faviconPath
  });
});

// BULLETIN
router.get('/boletin', (req, res) => {
  res.render('es/boletin', { 
    title: 'Boletín Parroquial - Nuestra Señora Reyna de Los Ángeles', 
    lang: 'es', 
    page: 'bulletin', 
    favicon: faviconPath
  });
});

// PARISH GROUPS
router.get('/grupos', (req, res) => {
  res.render('es/grupos', { 
    title: 'Grupos Parroquiales - Nuestra Señora Reyna de Los Ángeles', 
    lang: 'es', 
    page: 'groups', 
    favicon: faviconPath
  });
});

// CHAPELS & COMMUNITIES
router.get('/comunidades', (req, res) => {
  res.render('es/comunidades', { 
    title: 'Capillas y Comunidades - Nuestra Señora Reyna de Los Ángeles', 
    lang: 'es', 
    page: 'communities', 
    favicon: faviconPath
  });
});

// HOMILIES
router.get('/homilias', (req, res) => {
  res.render('es/homilias', { 
    title: 'Homilías - Nuestra Señora Reyna de Los Ángeles', 
    lang: 'es', 
    page: 'homilies', 
    favicon: faviconPath
  });
});

// EVENTS
router.get('/eventos', (req, res) => {
  res.render('es/eventos', { 
    title: 'Eventos Parroquiales - Nuestra Señora Reyna de Los Ángeles', 
    lang: 'es', 
    page: 'events', 
    favicon: faviconPath
  });
});

// CONTACT
router.get('/contacto', (req, res) => {
  res.render('es/contacto', { 
    title: 'Contacto - Nuestra Señora Reyna de Los Ángeles', 
    lang: 'es', 
    page: 'contact', 
    favicon: faviconPath
  });
});

module.exports = router;
