'use strict';

let express = require('express');
let router = express.Router();

router.use('/ads/gallery', require('./apiGalleryController'));
router.use('/ads/favorite', require('./apiFavoriteController'));
router.use('/search', require('./apiSearchController'));
router.use('/locate', require('./apiLocationLatLong'));
router.use('/postad', require('./apiPostAdController'));
router.use('/edit', require('./apiEditAdController'));
router.use('/auth', require('./apiAuthController'));
router.use('/irs', require('./apiImageCategory'));

module.exports = router;
