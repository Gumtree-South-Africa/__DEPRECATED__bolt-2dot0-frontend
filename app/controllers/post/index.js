'use strict';

let express = require('express');
let router = express.Router();

router.use('/', require('./postpageController'));

module.exports = router;
