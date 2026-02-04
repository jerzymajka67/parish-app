const express = require('express');
const router = express.Router();

const requireLogin = require('../../middleware/auth');


// All admin routes (kept existing behavior; add buildTreeHTML to /events render)
router.get('/',  requireLogin, (req, res) => {
  res.render('pages/admin/masses', { 
    layout: 'layouts/admin',
    title: 'Masses - admin', 
    lang: 'en', 
    page: 'masses',
    favicon: '/images/logo-olqa-mini.png'
  });
});

module.exports = router;