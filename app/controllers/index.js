'use strict';

let express = require('express');
let router = express.Router();

// router.use('/boot', require(process.cwd() + '/app/controllers/boot/*.js'));
router.use('/boot', require('./boot'));
router.use('/api', require('./api'));
router.use('/post', require('./post'));
router.use('/', require('./all'));

module.exports = router;
