'use strict';

let express = require('express');
let router = express.Router();

router.use('/api', require('./api/index'));
router.use('/', require('./post'));

module.exports = router;
