'use strict';

let express = require('express');
let router = express.Router();

router.use('/api', require('./api/index'));
router.use('/post.html', require('./all/postAdController'));
router.use('/', require('./all/index'));

module.exports = router;
