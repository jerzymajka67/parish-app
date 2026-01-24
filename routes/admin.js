const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads');
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

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
  res.render('admin/events', { 
    layout: 'layouts/admin',
    title: 'Parish Events - admin', 
    lang: 'en', 
    page: 'events',
    favicon: '/images/logo-olqa-mini.png'
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

router.post('/upload-image',
  requireLogin,
  upload.single('image'),
  (req, res) => {

    if (!req.file) {
      return res.send('No file uploaded');
    }

    res.redirect('/admin');
});

module.exports = router;
