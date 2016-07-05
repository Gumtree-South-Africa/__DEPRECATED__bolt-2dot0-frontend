'use strict';

let express = require('express');
let router = express.Router();

router.use('/', require('./bootController'));

module.exports = router;
