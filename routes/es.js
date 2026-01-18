const express = require('express');
const router = express.Router();

// HOME
router.get('/inicio', (req, res) => {
  res.render('es/inicio', { title: 'Inicio - Parroquia San José', lang: 'es', page: 'home' });
});

// ABOUT
router.get('/sobre', (req, res) => {
  res.render('es/sobre', { title: 'Sobre la Parroquia - Parroquia San José', lang: 'es', page: 'about' });
});

// MASSES & DEVOTIONS
router.get('/misas', (req, res) => {
  res.render('es/misas', { title: 'Misas y Devociones - Parroquia San José', lang: 'es', page: 'masses' });
});

// PARISH OFFICE
router.get('/oficina', (req, res) => {
  res.render('es/oficina', { title: 'Oficina Parroquial - Parroquia San José', lang: 'es', page: 'office' });
});

// BULLETIN
router.get('/boletin', (req, res) => {
  res.render('es/boletin', { title: 'Boletín Parroquial - Parroquia San José', lang: 'es', page: 'bulletin' });
});

// PARISH GROUPS
router.get('/grupos', (req, res) => {
  res.render('es/grupos', { title: 'Grupos Parroquiales - Parroquia San José', lang: 'es', page: 'groups' });
});

// CHAPELS & COMMUNITIES
router.get('/comunidades', (req, res) => {
  res.render('es/comunidades', { title: 'Capillas y Comunidades - Parroquia San José', lang: 'es', page: 'communities' });
});

// HOMILIES
router.get('/homilias', (req, res) => {
  res.render('es/homilias', { title: 'Homilías - Parroquia San José', lang: 'es', page: 'homilies' });
});

// EVENTS
router.get('/eventos', (req, res) => {
  res.render('es/eventos', { title: 'Eventos Parroquiales - Parroquia San José', lang: 'es', page: 'events' });
});

// CONTACT
router.get('/contacto', (req, res) => {
  res.render('es/contacto', { title: 'Contacto - Parroquia San José', lang: 'es', page: 'contact' });
});

module.exports = router;
