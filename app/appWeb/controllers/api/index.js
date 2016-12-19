'use strict';

let express = require('express');
let router = express.Router();

router.use('/ads/gallery', require('./apiGalleryController'));
router.use('/ads/favorite', require('./apiFavoriteController'));
router.use('/ads/flag', require('./apiFlagAdController'));
router.use('/search', require('./apiSearchController'));
router.use('/locate', require('./apiLocationLatLong'));
router.use('/postad', require('./apiPostAdController'));
router.use('/edit', require('./apiEditAdController'));
router.use('/auth', require('./apiAuthController'));
router.use('/push', require('./apiPushController'));
router.use('/postad/imagerecognition', require('./apiImageRecognitionController'));
router.use('/promotead', require('./apiPromoteAdController'));

module.exports = router;
