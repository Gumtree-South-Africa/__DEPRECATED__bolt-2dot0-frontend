'use strict';

let express = require('express');
let router = express.Router();

router.use('/ads', require('./apiGalleryController'));
router.use('/search', require('./apiSearchController'));
router.use('/locate', require('./apiLocationLatLong'));
router.use('/postad', require('./apiPostAdController'));

module.exports = router;
