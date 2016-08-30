'use strict';

let express = require('express');
let router = express.Router();

router.use('/ads', require('./apiGalleryController'));
router.use('/locate', require('./apiLocationLatLong'));
router.use('/postad', require('./apiPostAdController'));
router.use('/push', require('./apiPushController'));
router.use('/search', require('./apiSearchController'));

module.exports = router;
