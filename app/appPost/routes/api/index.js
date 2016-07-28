'use strict';

let express = require('express');
let router = express.Router();

router.use('/postad', require('../../controllers/apiPostAdController'));

module.exports = router;
