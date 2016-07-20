'use strict';

let express = require('express');
let router = express.Router();
let cwd = process.cwd();
let pageControllerUtil = require(cwd + '/app/appWeb/controllers/all/PageControllerUtil');
let PostAdPageModel = require(cwd + '/app/builders/page/PostAdPageModel');

router.use('/', (req, res, next) => {
	let model = new PostAdPageModel(req, res);
	model.populateData().then((modelData) => {
		pageControllerUtil.postController(req, res, next, 'postAd/views/hbs/postAd_', modelData);
	});
});

module.exports = router;
