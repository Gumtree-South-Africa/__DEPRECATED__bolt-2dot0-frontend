'use strict';

let express = require('express');
let router = express.Router();

router.use('/ads', require('./apiGalleryController'));

module.exports = router;
