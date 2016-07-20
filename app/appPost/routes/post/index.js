'use strict';

let express = require('express');
let router = express.Router();

router.use('/', require('../../controllers/postAdController'));

module.exports = router;
