'use strict';

let express = require('express');
let router = express.Router();
let cwd = process.cwd();
let pageControllerUtil = require(cwd + '/app/appWeb/controllers/all/PageControllerUtil');
let PromoteAdPageModel = require(cwd + '/app/builders/page/PromoteAdPageModel');
let pagetypeJson = require(cwd + '/app/config/pagetype.json');

let promoteAdData = {
	extendModelData: (req, modelData) => {
		modelData.header.pageType = modelData.pagename;
		modelData.header.pageTitle = modelData.seo.pageTitle;
		modelData.header.metaDescription = modelData.seo.description;
		modelData.header.metaRobots = modelData.seo.robots;
		modelData.header.canonical = modelData.header.homePageUrl + "/promoteAd";
		// CSS
		if (modelData.header.min) {
			modelData.header.containerCSS.push(modelData.header.localeCSSPath + '/PromoteAdPage.min.css');
		} else {
			modelData.header.containerCSS.push(modelData.header.localeCSSPath + '/PromoteAdPage.css');
		}
		modelData.footer.javascripts.push(modelData.footer.baseJSMinUrl + "AnalyticsLegacyBundle.min.js");
		modelData.footer.javascripts.push(modelData.footer.baseJSMinUrl + "PromoteAd_desktop_" + modelData.locale + ".js");
		modelData.footer.javascripts.push('https://www.google.com/jsapi');
	}
};

router.get('/:id?', (req, res, next) => {
	let adId = req.params.id;

	// If user is not logged in, force user to login; and on login success it comes back to edit
	let authenticationCookie = req.cookies['bt_auth'];
	if (!authenticationCookie) {
		let returnUrl = `/edit/${adId}`;
		res.redirect(`/login.html?redirect=${returnUrl}`);
		return;
	}

	req.app.locals.pagetype = pagetypeJson.pagetype.AD_PROMOTE_PAGE;
	let promoteAdPageModel = new PromoteAdPageModel(req, res, adId);
	let modelPromise = promoteAdPageModel.populateData();

	modelPromise.then((modelData) => {
		promoteAdData.extendModelData(req, modelData);
		modelData.adId = adId;
		modelData.header.distractionFree = false;
		modelData.footer.distractionFree = false;
		modelData.localCurrencies = res.locals.config.bapiConfigData.content.localCurrencies;

		pageControllerUtil.postController(req, res, next, 'promoteAd/views/hbs/promoteAd_', modelData);
	}).fail((err) => {
		console.error(err);
		console.error(err.stack);
		//Throw a 404 page for 404 or 401 (unauthorized). otherwise 500
		return (err.statusCode === 404 || err.statusCode === 400 || err.statusCode === 401) ? next() : next(err);
	});
});

module.exports = router;
