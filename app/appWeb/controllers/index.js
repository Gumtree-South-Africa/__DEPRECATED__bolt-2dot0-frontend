'use strict';

let express = require('express');
let router = express.Router();

router.use('/api', require('./api/index'));
router.use('/post', require('./all/postAdController'));
router.use('/edit', require('./all/editAdController'));
router.use('/', require('./all/index'));

module.exports = router;
