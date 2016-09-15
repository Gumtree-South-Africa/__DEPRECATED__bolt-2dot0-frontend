'use strict';

let express = require('express');
let router = express.Router();
let cwd = process.cwd();
let pageControllerUtil = require(cwd + '/app/appWeb/controllers/all/PageControllerUtil');
let EditAdPageModel = require(cwd + '/app/builders/page/EditAdPageModel');
let EpsModel = require(cwd + '/app/builders/common/EpsModel');
let pagetypeJson = require(cwd + '/app/config/pagetype.json');

let EditAdPage = {
	extendModelData: (req, modelData) => {
		modelData.header.pageType = modelData.pagename;
		modelData.header.pageTitle = modelData.seo.pageTitle;
		modelData.header.metaDescription = modelData.seo.description;
		modelData.header.metaRobots = modelData.seo.robots;
		modelData.header.canonical = modelData.header.homePageUrl;
		// CSS
		if (modelData.header.min) {
			modelData.header.containerCSS.push(modelData.header.localeCSSPath + '/EditAdPage.min.css');
		} else {
			modelData.header.containerCSS.push(modelData.header.localeCSSPath + '/EditAdPage.css');
		}
		modelData.footer.javascripts.push(modelData.footer.baseJSMinUrl + "EditAd_desktop_es_MX.js");
		modelData.footer.javascripts.push(modelData.footer.baseJSMinUrl + "AnalyticsLegacyBundle.min.js");
	}
};

router.get('/:id?', (req, res, next) => {
	req.app.locals.pagetype = pagetypeJson.pagetype.EDIT_AD;
	let adId = req.params.id;
	let editAdPageModel = new EditAdPageModel(req, res, adId);
	let modelPromise = editAdPageModel.populateData();

	modelPromise.then((modelData) => {
		EditAdPage.extendModelData(req, modelData);
		modelData.adId = adId;

		modelData.header.distractionFree = false;
		modelData.footer.distractionFree = false;
		modelData.eps = EpsModel();

		pageControllerUtil.postController(req, res, next, 'editAd/views/hbs/editAd_', modelData);
	}).fail((err) => {
		console.error(err);
		console.error(err.stack);
		//Throw a 404 page for 404 or 401 (unauthorized). otherwise 500
		return (err.statusCode === 404 || err.statusCode === 400 || err.statusCode === 401) ? next() : next(err);
	});
});

module.exports = router;
