'use strict';

let express = require('express');
let router = express.Router();

router.use('/fb', require('./fb'));

module.exports = router;

