'use strict';

let express = require('express');
let router = express.Router();

router.use('/boot', require('./boot/index'));
router.use('/api', require('./api/index'));
router.use('/', require('./all/index'));

module.exports = router;
