const express = require('express');
const router = express.Router();

const requireLogin = require('../../middleware/auth');


// All admin routes (kept existing behavior; add buildTreeHTML to /events render)
router.get('/',  requireLogin, (req, res) => {
  res.render('pages/admin/home', { 
    layout: 'layouts/admin',
    title: 'Home - admin', 
    lang: 'en', 
    page: 'home',
    favicon: '/images/logo-olqa-mini.png'
  });
});
module.exports = router;