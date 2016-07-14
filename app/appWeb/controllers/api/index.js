'use strict';

let express = require('express');
let router = express.Router();

router.use('/ads', require('./apiGalleryController'));
router.use('/search', require('./apiSearchController'));

module.exports = router;
