'use strict';

let express = require('express');
let router = express.Router();
let cwd = process.cwd();
let pageControllerUtil = require('../../controllers/all/PageControllerUtil');
let pageTypeJson = require(`${cwd}/app/config/pagetype.json`);
let abTestPagesJson = require(`${cwd}/app/config/abtestpages.json`);
let RegisterPageModel = require('../../../builders/page/RegisterPageModel');

let extendModelData = (req, modelData) => {
	modelData.header.pageType = modelData.pagename;
	modelData.header.pageTitle = modelData.seo.pageTitle;
	modelData.header.metaDescription = modelData.seo.description;
	modelData.header.metaRobots = modelData.seo.robots;
	modelData.header.canonical = modelData.header.homePageUrl;
	// CSS
	if (modelData.header.min) {
		modelData.header.containerCSS.push(modelData.header.localeCSSPath + '/RegisterPage.min.css');
	} else {
		modelData.header.containerCSS.push(modelData.header.localeCSSPath + '/RegisterPage.css');
	}
	modelData.footer.javascripts.push(modelData.footer.baseJSMinUrl + 'RegisterPage_desktop_es_MX.js');
	modelData.footer.javascripts.push(modelData.footer.baseJSMinUrl + 'AnalyticsLegacyBundle.min.js');
};

router.get('/', (req, res, next) => {
	req.app.locals.pagetype = pageTypeJson.pagetype.REGISTER_PAGE;
	req.app.locals.abtestpage = abTestPagesJson.pages.R;
	let registerPageModel = new RegisterPageModel(req, res);
	let redirectUrl = req.query.redirect;

	registerPageModel.populateData().then((modelData) => {
		extendModelData(req, modelData);
		modelData.header.distractionFree = true;
		modelData.footer.distractionFree = true;
		modelData.redirectUrl = redirectUrl;

		pageControllerUtil.postController(req, res, next, 'registerPage/views/hbs/registerPage_', modelData);
	}).fail((err) => {
		next(err);
	});
});

module.exports = router;
