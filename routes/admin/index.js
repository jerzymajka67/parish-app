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
const bulletin_filesRoutes = require('./bulletin_files');
const groupsRoutes = require('./groups');
const groups_filesRoutes = require('./groups_files');
const communitiesRoutes = require('./communities');
const communities_filesRoutes = require('./communities_files');
const homiliesRoutes = require('./homilies');
const homilies_filesRoutes = require('./homilies_files');
const eventsRoutes = require('./events');
const events_filesRoutes = require('./events_files');
const contactRoutes = require('./contact');
const contentRoutes = require('./conten');
const adminRoutes = require('./admin'); 
const logoutRoutes = require('./logout'); 
const photosRoutes = require('./photos');
const photos_filesRoutes = require('./photos_files');
// Mount routes
router.use('/home', homeRoutes);            // /admin/home
router.use('/about', aboutRoutes);      // /admin/about
router.use('/masses', massesRoutes);    
router.use('/office', officeRoutes);    
router.use('/bulletin', bulletinRoutes);
router.use('/bulletin_files', bulletin_filesRoutes);
router.use('/groups', groupsRoutes); 
router.use('/groups_files', groups_filesRoutes); 
router.use('/communities', communitiesRoutes);
router.use('/communities_files', communities_filesRoutes);
router.use('/homilies', homiliesRoutes);
router.use('/homilies_files', homilies_filesRoutes);
router.use('/events', eventsRoutes);    
router.use('/events_files', events_filesRoutes); 
router.use('/contact', contactRoutes);  // /admin/contact
router.use('/conten', contentRoutes);
router.use('/photos', photosRoutes);
router.use('/photos_files', photos_filesRoutes);
router.use('/', adminRoutes);       // /admin
router.use('/logout', logoutRoutes); // /admin/logout

module.exports = router;
