'use strict';

let express = require('express');
let router = express.Router();
let cwd = process.cwd();
let pageControllerUtil = require(cwd + '/app/appWeb/controllers/all/PageControllerUtil');
let PostAdPageModel = require(cwd + '/app/builders/page/PostAdPageModel');
let EpsModel = require(cwd + '/app/builders/common/EpsModel');

let postAdData = {
	extendModelData: (req, modelData) => {
		// CSS
		modelData.header.containerCSS.push(modelData.header.localeCSSPath + '/PostAdPage.css');
		modelData.footer.javascripts.push(modelData.footer.baseJSMinUrl + "PostAd_desktop_es_MX.js");
	}
};

router.use('/', (req, res, next) => {
	let postAdModel = new PostAdPageModel(req, res);
	let modelPromise = postAdModel.populateData();

	modelPromise.then((modelData) => {
		postAdData.extendModelData(req, modelData);
		modelData.header.distractionFree = true;
		modelData.footer.distractionFree = true;
		modelData.eps = EpsModel();

		pageControllerUtil.postController(req, res, next, 'postAd/views/hbs/postAd_', modelData);
	}).fail((err) => {
		console.error(err);
		console.error(err.stack);
		next(err);
	});
});

module.exports = router;
