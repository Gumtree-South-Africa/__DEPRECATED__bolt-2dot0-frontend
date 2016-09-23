'use strict';

let express = require('express');
let router = express.Router();
let cwd = process.cwd();
let pageControllerUtil = require('../../controllers/all/PageControllerUtil');
let pageTypeJson = require(`${cwd}/app/config/pagetype.json`);
let ActivatePageModel = require('../../../builders/page/ActivatePageModel');
let EpsModel = require('../../../builders/common/EpsModel');

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

router.get('/', (req, res, next) => {
	req.app.locals.pagetype = pageTypeJson.pagetype.ACTIVATE_PAGE;
	let activatePageModel = new ActivatePageModel(req, res);

	activatePageModel.populateData().then((modelData) => {
		extendModelData(req, modelData);
		modelData.header.distractionFree = true;
		modelData.footer.distractionFree = true;
		modelData.eps = EpsModel();

		pageControllerUtil.postController(req, res, next, 'activatePage/views/hbs/activatePage_', modelData);
	}).fail((err) => {
		next(err);
	});
});

module.exports = router;
