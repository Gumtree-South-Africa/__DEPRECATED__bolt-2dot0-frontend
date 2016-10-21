'use strict';

let express = require('express');
let router = express.Router();

router.use('/webhook', require('./webhook.js'));

module.exports = router;
