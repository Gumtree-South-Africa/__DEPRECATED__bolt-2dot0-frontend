'use strict';

let express = require('express');
let router = express.Router();
let cwd = process.cwd();
let pageControllerUtil = require('../../controllers/all/PageControllerUtil');
let pageTypeJson = require(`${cwd}/app/config/pagetype.json`);
let LoginPageModel = require('../../../builders/page/LoginPageModel');

let extendModelData = (req, modelData) => {
	modelData.header.pageType = modelData.pagename;
	modelData.header.pageTitle = modelData.seo.pageTitle;
	modelData.header.metaDescription = modelData.seo.description;
	modelData.header.metaRobots = modelData.seo.robots;
	modelData.header.canonical = modelData.header.homePageUrl;
	// CSS
	if (modelData.header.min) {
		modelData.header.containerCSS.push(modelData.header.localeCSSPath + '/LoginPage.min.css');
	} else {
		modelData.header.containerCSS.push(modelData.header.localeCSSPath + '/LoginPage.css');
	}
	modelData.footer.javascripts.push(modelData.footer.baseJSMinUrl + "LoginPage_desktop_es_MX.js");
	modelData.footer.javascripts.push(modelData.footer.baseJSMinUrl + "AnalyticsLegacyBundle.min.js");
};

router.get('/', (req, res, next) => {
	req.app.locals.pagetype = pageTypeJson.pagetype.LOGIN_PAGE;
	let loginPageModel = new LoginPageModel(req, res);
	let redirectUrl = req.query.redirect;

	loginPageModel.populateData().then((modelData) => {
		extendModelData(req, modelData);
		modelData.header.distractionFree = true;
		modelData.footer.distractionFree = true;
		modelData.redirectUrl = redirectUrl;

		pageControllerUtil.postController(req, res, next, 'loginPage/views/hbs/loginPage_', modelData);
	}).fail((err) => {
		next(err);
	});
});

module.exports = router;
