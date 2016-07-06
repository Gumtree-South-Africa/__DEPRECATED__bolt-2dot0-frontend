'use strict';

let express = require('express');
let router = express.Router();

router.use('/post', require('./post'));

module.exports = router;
