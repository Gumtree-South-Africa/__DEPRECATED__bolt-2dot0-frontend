'use strict';

let express = require('express');
let router = express.Router();
let cwd = process.cwd();
let pageControllerUtil = require(cwd + '/app/appWeb/controllers/all/PageControllerUtil');

router.use('/', (req, res, next) => {
	pageControllerUtil.postController(req, res, next, 'postAd/views/postAd_', {});
});

module.exports = router;
