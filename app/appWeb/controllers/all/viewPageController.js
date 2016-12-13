'use strict';

let express = require('express');
let router = express.Router();
let cwd = process.cwd();
let pageControllerUtil = require('../../controllers/all/PageControllerUtil');
let pageTypeJson = require(`${cwd}/app/config/pagetype.json`);
let abTestPagesJson = require(`${cwd}/app/config/abtestpages.json`);
let ViewPageModel = require('../../../builders/page/ViewPageModel');
let config = require('config');

const SITE_KEY = config.get('recaptcha.SITE_KEY');

let extendModelData = (req, modelData) => {
	modelData.header.pageType = modelData.pagename;
	modelData.header.pageTitle = modelData.seo.pageTitle;
	modelData.header.metaDescription = modelData.seo.description;
	modelData.header.metaRobots = modelData.seo.robots;
	modelData.header.canonical = modelData.header.viewPageUrl.replace('v-', 'a-');
	// CSS
	if (modelData.header.min) {
		modelData.header.containerCSS.push(modelData.header.localeCSSPath + '/ViewPage.min.css');
	} else {
		modelData.header.containerCSS.push(modelData.header.localeCSSPath + '/ViewPage.css');
	}
	// JS
	if (!modelData.footer.min) {
		if (modelData.header.enableLighterVersionForMobile) {
			modelData.footer.javascripts.push(modelData.footer.baseJSMinUrl + `ViewPage_desktop_${modelData.locale}.js`);
		} else {
			modelData.footer.javascripts.push(modelData.footer.baseJSMinUrl + `ViewPage_mobile_${modelData.locale}.js`);
		}
	} else {
		if (modelData.header.enableLighterVersionForMobile) {
			modelData.footer.javascripts.push(modelData.footer.baseJSMinUrl + `ViewPage_desktop_${modelData.locale}.js`);
		} else {
			modelData.footer.javascripts.push(modelData.footer.baseJSMinUrl + `ViewPage_mobile_${modelData.locale}.js`);
		}
	}
	modelData.footer.javascripts.push(modelData.footer.baseJSMinUrl + 'HomePageV2Legacy.min.js');
	modelData.footer.javascripts.push(modelData.footer.baseJSMinUrl + 'AnalyticsLegacyBundle.min.js');
	modelData.footer.javascripts.push(modelData.footer.baseJSMinUrl + 'Zoom.min.js');
};

router.get('/:id?', (req, res, next) => {
	req.app.locals.pagetype = pageTypeJson.pagetype.VIP;
	req.app.locals.abtestpage = abTestPagesJson.pages.V;
	req.app.locals.isSeoUrl = false;

	let adId = req.params.id;
	if(adId === undefined) {
		// Parse adId from SEO URL
		adId = req.originalUrl.substring(req.originalUrl.lastIndexOf('/') + 1);
		req.app.locals.isSeoUrl = true;
	}

	// If no adId, redirect to homepage.
	if (adId === undefined) {
		res.redirect('/');
		return;
	}

	// Remove any extra query parameters from adId
	if (adId.lastIndexOf('?') !== -1) {
		adId = adId.substring(0, adId.lastIndexOf('?'));
	}

	// AB: If not 2.0 context, then redirect to 1.0 VIP
	if (!pageControllerUtil.is2dot0Version(res, req.app.locals.abtestpage)) {
		let redirectUrl = '';
		if (req.app.locals.isSeoUrl === true) {
			redirectUrl = req.originalUrl.replace('v-', 'a-'); // redirect to 1.0 SEO version of this page
		} else {
			redirectUrl = '/view.html?adId=' + adId; // redirect to 1.0 version of this page
		}
		res.redirect(redirectUrl);
		return;
	}

	let viewPageModel = new ViewPageModel(req, res, adId);
	let redirectUrl = req.query.redirect;

	viewPageModel.populateData().then((modelData) => {
		if (req.app.locals.isSeoUrl === true) {
			let originalSeoUrl = req.originalUrl;
			let dataSeoVipUrl = modelData.advert.seoVipUrl.replace('a-', 'v-');
			if (originalSeoUrl !== dataSeoVipUrl) {
				res.redirect(dataSeoVipUrl);
				return;
			}
		}

		extendModelData(req, modelData);
		modelData.adId = adId;

		modelData.header.distractionFree = false;
		modelData.footer.distractionFree = false;
		modelData.search = true;

		modelData.redirectUrl = redirectUrl;
		modelData.recaptchaSiteKey = SITE_KEY;

		pageControllerUtil.postController(req, res, next, 'viewPage/views/hbs/viewPage_', modelData);
	}).fail((err) => {
		console.error(err);
		console.error(err.stack);
		//Throw a 404 page for 404 or 401 (unauthorized). otherwise 500
		return (err.statusCode === 404 || err.statusCode === 400 || err.statusCode === 401) ? next() : next(err);
	});
});

module.exports = router;
