const express = require('express');
const router = express.Router();

router.get('/home', (req, res) => {
  res.render('en/home', { title: 'Home - St. Joseph Parish', lang: 'en', page: 'home' });
});

router.get('/about', (req, res) => {
  res.render('en/about', { title: 'About - St. Joseph Parish', lang: 'en', page: 'about' });
});

router.get('/masses', (req, res) => {
  res.render('en/masses', { title: 'Masses & Devotions - St. Joseph Parish', lang: 'en', page: 'masses' });
});

router.get('/office', (req, res) => {
  res.render('en/office', { title: 'Parish Office - St. Joseph Parish', lang: 'en', page: 'office' });
});

router.get('/bulletin', (req, res) => {
  res.render('en/bulletin', { title: 'Bulletin - St. Joseph Parish', lang: 'en', page: 'bulletin' });
});

router.get('/groups', (req, res) => {
  res.render('en/groups', { title: 'Parish Groups - St. Joseph Parish', lang: 'en', page: 'groups' });
});

router.get('/communities', (req, res) => {
  res.render('en/communities', { title: 'Chapels & Communities - St. Joseph Parish', lang: 'en', page: 'communities' });
});

router.get('/homilies', (req, res) => {
  res.render('en/homilies', { title: 'Homilies - St. Joseph Parish', lang: 'en', page: 'homilies' });
});

router.get('/events', (req, res) => {
  res.render('en/events', { title: 'Parish Events - St. Joseph Parish', lang: 'en', page: 'events' });
});

router.get('/contact', (req, res) => {
  res.render('en/contact', { title: 'Contact Us - St. Joseph Parish', lang: 'en', page: 'contact' });
});

module.exports = router;


