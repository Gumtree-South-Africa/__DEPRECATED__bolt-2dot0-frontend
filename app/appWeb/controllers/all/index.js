'use strict';

let express = require('express');
let router = express.Router();

router.use('/manifest.json', require('./manifestController'));
router.use('/quickpost', require('./quickpostController'));
router.use('/', require('./homepageController'));

module.exports = router;
