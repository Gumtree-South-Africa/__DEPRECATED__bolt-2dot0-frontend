'use strict';

let express = require('express');
let router = express.Router();
let cwd = process.cwd();
let pageControllerUtil = require('../../controllers/all/PageControllerUtil');
let pageTypeJson = require(`${cwd}/app/config/pagetype.json`);
let ActivatePageModel = require('../../../builders/page/ActivatePageModel');


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
	modelData.footer.javascripts.push(modelData.footer.baseJSMinUrl + "ActivatePage_desktop_es_MX.js");
	modelData.footer.javascripts.push(modelData.footer.baseJSMinUrl + "AnalyticsLegacyBundle.min.js");
};

router.get('/:emailAddress', (req, res, next) => {

	let activateParams = {};
	
	// validate the inputs
	// note query string is all lower cased
	if (!req.query.activationcode) {
		res.status(400);
		res.send({error: "query param missing"});
		return;
	}
	activateParams.activationCode = req.query.activationcode;

	if (activateParams.activationCode === "resend") {
		// todo: resend the email
		activateParams.resent = true;
	}

	if (!req.params.emailAddress) {
		res.status(400);
		res.send({error: "email param missing"});
		return;
	}
	activateParams.emailAddress = req.params.emailAddress;

	req.app.locals.pagetype = pageTypeJson.pagetype.ACTIVATE_PAGE;
	let activatePageModel = new ActivatePageModel(req, res, activateParams);

	activatePageModel.populateData().then((modelData) => {
		extendModelData(req, modelData);
		modelData.header.distractionFree = true;
		modelData.footer.distractionFree = true;

		if (modelData.activate.accessToken) {
			// not setting expires or age so it will be a "session" cookie
			res.cookie('bt_auth', modelData.activate.accessToken, { httpOnly: true });
		}

		pageControllerUtil.postController(req, res, next, 'activatePage/views/hbs/activatePage_', modelData);
	}).fail((err) => {
		next(err);
	});
});

module.exports = router;
