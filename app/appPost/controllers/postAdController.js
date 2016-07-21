'use strict';

let express = require('express');
let router = express.Router();
let cwd = process.cwd();
let pageControllerUtil = require(cwd + '/app/appWeb/controllers/all/PageControllerUtil');
let PostAdPageModel = require(cwd + '/app/builders/page/PostAdPageModel');

let postAdData = {
	extendModelData: (req, modelData) => {
		// CSS
		modelData.header.pageCSSUrl = modelData.header.baseCSSUrl + 'PostAdPage.css';
	}
};

router.use('/', (req, res, next) => {
	let postAdModel = new PostAdPageModel(req, res);
	let modelPromise = postAdModel.populateData();

	modelPromise.then((modelData) => {
		postAdData.extendModelData(req, modelData);

		pageControllerUtil.postController(req, res, next, 'postAd/views/hbs/postAd_', modelData);
	}).fail((err) => {
		console.error(err);
		console.error(err.stack);
		next(err);
	});
});

module.exports = router;
