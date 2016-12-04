'use strict';

let express = require('express');
let router = express.Router();
let cwd = process.cwd();
let pageControllerUtil = require('../../controllers/all/PageControllerUtil');
let ActivatePageModel = require('../../../builders/page/ActivatePageModel');

let pageTypeJson = require(`${cwd}/app/config/pagetype.json`);
let abTestPagesJson = require(`${cwd}/app/config/abtestpages.json`);

let extendModelData = (req, modelData) => {
	modelData.header.pageType = modelData.pagename;
	modelData.header.pageTitle = modelData.seo.pageTitle;
	modelData.header.metaDescription = modelData.seo.description;
	modelData.header.metaRobots = modelData.seo.robots;
	modelData.header.canonical = modelData.header.homePageUrl;
	// CSS
	if (modelData.header.min) {
		modelData.header.containerCSS.push(modelData.header.localeCSSPath + '/ActivatePage.min.css');
	} else {
		modelData.header.containerCSS.push(modelData.header.localeCSSPath + '/ActivatePage.css');
	}
	modelData.footer.javascripts.push(modelData.footer.baseJSMinUrl + 'ActivatePage_desktop_es_MX.js');
	modelData.footer.javascripts.push(modelData.footer.baseJSMinUrl + 'AnalyticsLegacyBundle.min.js');
};

router.get('/:emailAddress', (req, res, next) => {

	let activateParams = {};

	// validate the inputs
	if (!req.query.activationCode) {
		res.status(400);
		res.send({error: "query param missing"});
		return;
	}
	activateParams.activationCode = req.query.activationCode;

	if (activateParams.activationCode === 'resend') {
		// todo: resend the email
		activateParams.resent = true;
	}

	// since this is a url param, the route will fail with a 404 before we even get here
	// todo: change this to test for a valid email
	/*
	if (!req.params.emailAddress) {
		res.status(400);
		res.send({error: "email param missing"});
		return;
	}
	*/
	activateParams.emailAddress = req.params.emailAddress;

	req.app.locals.pagetype = pageTypeJson.pagetype.ACTIVATE_PAGE;
	req.app.locals.abtestpage = abTestPagesJson.pages.A;
	let activatePageModel = new ActivatePageModel(req, res, activateParams);
	let redirectUrl = req.query.redirect;

	activatePageModel.populateData().then((modelData) => {
		extendModelData(req, modelData);
		modelData.header.distractionFree = true;
		modelData.footer.distractionFree = true;

		if (modelData.activate.accessToken) {
			// not setting expires or age so it will be a "session" cookie
			res.cookie('bt_auth', modelData.activate.accessToken, { httpOnly: true });
		}

		modelData.activate.params.redirect = redirectUrl || '/';
		pageControllerUtil.postController(req, res, next, 'activatePage/views/hbs/activatePage_', modelData);
	}).fail((err) => {
		next(err);
	});
});

module.exports = router;
