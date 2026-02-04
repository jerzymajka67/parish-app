const express = require('express');
const router = express.Router();

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
  res.render('pages/user/en/events', { 
    title: 'Parish Events - Our Lady, Queen of Angels', 
    lang: 'en', 
    page: 'events',
    favicon: '/images/logo-olqa-mini.png'
  });
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
