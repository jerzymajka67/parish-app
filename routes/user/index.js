const express = require('express');
const router = express.Router();

const enRoutes = require('./en');
const esRoutes = require('./es');

router.use('/', enRoutes);    
router.use('/en', enRoutes);    
router.use('/es', esRoutes);   

module.exports = router;
