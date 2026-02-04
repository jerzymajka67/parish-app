const express = require('express');
const router = express.Router();

const ADMIN_PASSWORD = 'jerzy';
// Admin home page
router.get('/', (req, res) => {
  if (req.session.loggedIn) {
    res.render('pages/admin/admin', {
      layout: 'layouts/admin', 
      title: 'Admin Panel - Our Lady, Queen of Angels',
      lang: 'en',
      page: 'admin',
      favicon: '/images/logo-olqa-mini.png'
    });
  } else {
    res.render('pages/admin/login', {
      layout: false, // no layout for login page
      error: null
    });
  }
});
router.post('/', (req, res) => {
  const { password } = req.body;

  if (password === ADMIN_PASSWORD) {
    req.session.loggedIn = true;
    res.redirect('/admin');
  } else {
    res.render('pages/admin/login', {
      error: 'Incorrect password',
      layout: false
    });
  }
});


module.exports = router;
