const express = require('express');
const router = express.Router();

// per-page routers
const homeRouter = require('./home');
const aboutRouter = require('./about');
const massesRouter = require('./masses');
const officeRouter = require('./office');
const bulletinRouter = require('./bulletin');
const groupsRouter = require('./groups');
const communitiesRouter = require('./communities');
const homiliesRouter = require('./homilies');
const eventsRouter = require('./events');
const contactRouter = require('./contact');

// mount
router.use('/', homeRouter);
router.use('/about', aboutRouter);
router.use('/masses', massesRouter);
router.use('/office', officeRouter);
router.use('/bulletin', bulletinRouter);
router.use('/groups', groupsRouter);
router.use('/communities', communitiesRouter);
router.use('/homilies', homiliesRouter);
router.use('/events', eventsRouter);
router.use('/contact', contactRouter);

module.exports = router;