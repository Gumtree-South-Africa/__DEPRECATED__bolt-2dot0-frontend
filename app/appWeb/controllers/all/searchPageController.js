'use strict';

let express = require('express');
let router = express.Router();
let cwd = process.cwd();
let pageControllerUtil = require('../../controllers/all/PageControllerUtil');
let pageTypeJson = require(`${cwd}/app/config/pagetype.json`);
let SearchPageModel = require('../../../builders/page/SearchPageModel');

let extendModelData = (req, modelData) => {
	modelData.header.pageType = modelData.pagename;
	modelData.header.pageTitle = modelData.seo.pageTitle;
	modelData.header.metaDescription = modelData.seo.description;
	modelData.header.metaRobots = modelData.seo.robots;
	modelData.header.canonical = modelData.header.homePageUrl;
	// CSS
	console.log(modelData.footer.baseJSMinUrl);
	if (modelData.header.min) {
		modelData.header.containerCSS.push(modelData.header.localeCSSPath + '/SearchPage.min.css');
	} else {
		modelData.header.containerCSS.push(modelData.header.localeCSSPath + '/SearchPage.css');
	}
	if (!modelData.footer.min) {
		if (modelData.header.enableLighterVersionForMobile) {
			modelData.footer.javascripts.push(modelData.footer.baseJSMinUrl + `SearchPage_desktop_${modelData.locale}.js`);
		} else {
			modelData.footer.javascripts.push(modelData.footer.baseJSMinUrl + `SearchPage_mobile_${modelData.locale}.js`);
		}
	} else {
		if (modelData.header.enableLighterVersionForMobile) {
			modelData.footer.javascripts.push(modelData.footer.baseJSMinUrl + `SearchPage_desktop_${modelData.locale}.js`);
		} else {
			modelData.footer.javascripts.push(modelData.footer.baseJSMinUrl + `SearchPage_mobile_${modelData.locale}.js`);
		}
	}
	modelData.footer.javascripts.push(modelData.footer.baseJSMinUrl + 'AnalyticsLegacyBundle.min.js');
};

router.get('/search/:keyword?', (req, res, next) => {
	let keyword = req.params.keyword;


	req.app.locals.pagetype = pageTypeJson.pagetype.RESULTS_SEARCH;
	let searchPageModel = new SearchPageModel(req, res, keyword);
	let redirectUrl = req.query.redirect;

	searchPageModel.populateData().then((modelData) => {
		extendModelData(req, modelData);
		modelData.keyword = keyword;

		modelData.header.distractionFree = false;
		modelData.footer.distractionFree = false;
		modelData.search = true;

		modelData.redirectUrl = redirectUrl;

		pageControllerUtil.postController(req, res, next, 'searchPage/views/hbs/searchPage_', modelData);
	}).fail((err) => {
		console.error(err);
		console.error(err.stack);
		//Throw a 404 page for 404 or 401 (unauthorized). otherwise 500
		return (err.statusCode === 404 || err.statusCode === 400 || err.statusCode === 401) ? next() : next(err);
	});
});

module.exports = router;
