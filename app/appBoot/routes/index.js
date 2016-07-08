'use strict';

let express = require('express');
let router = express.Router();

router.use('/', require('./boot/index'));

module.exports = router;
