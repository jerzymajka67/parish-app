const express = require('express');
const router = express.Router();
router.use(express.urlencoded({ extended: true }));
router.use(express.json());
const session = require('express-session');

router.use(session({
  secret: 'borzyowysekret',
  resave: false,
  saveUninitialized: false
}));
const ADMIN_PASSWORD = 'jerzy';
// Routes
// Require all route files
const homeRoutes = require('./home');
const aboutRoutes = require('./about');
const massesRoutes = require('./masses');
const officeRoutes = require('./office');
const bulletinRoutes = require('./bulletin');
const groupsRoutes = require('./groups');
const communitiesRoutes = require('./communities');
const homiliesRoutes = require('./homilies');
const eventsRoutes = require('./events');
const contactRoutes = require('./contact');
const adminRoutes = require('./admin'); 
const logoutRoutes = require('./logout'); 

// Mount routes
router.use('/home', homeRoutes);            // /admin/home
router.use('/about', aboutRoutes);      // /admin/about
router.use('/masses', massesRoutes);    // /admin/masses
router.use('/office', officeRoutes);    // /admin/office
router.use('/bulletin', bulletinRoutes);// /admin/bulletin
router.use('/groups', groupsRoutes);    // /admin/groups
router.use('/communities', communitiesRoutes);// /admin/communities
router.use('/homilies', homiliesRoutes);// /admin/homilies
router.use('/events', eventsRoutes);    // /admin/events
router.use('/contact', contactRoutes);  // /admin/contact
router.use('/', adminRoutes);       // /admin
router.use('/logout', logoutRoutes); // /admin/logout

module.exports = router;
