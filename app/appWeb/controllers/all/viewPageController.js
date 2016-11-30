'use strict';

let express = require('express');
let router = express.Router();
let cwd = process.cwd();
let pageControllerUtil = require('../../controllers/all/PageControllerUtil');
let pageTypeJson = require(`${cwd}/app/config/pagetype.json`);
let ViewPageModel = require('../../../builders/page/ViewPageModel');

let extendModelData = (req, modelData) => {
	modelData.header.pageType = modelData.pagename;
	modelData.header.pageTitle = modelData.seo.pageTitle;
	modelData.header.metaDescription = modelData.seo.description;
	modelData.header.metaRobots = modelData.seo.robots;
	modelData.header.canonical = modelData.header.homePageUrl;
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
};

router.get('/:id?', (req, res, next) => {
	let adId = req.params.id;
	req.app.locals.isSeoUrl = false;
	if(adId === undefined) {
		// Parse adId from SEO URL
		// Example of view seo url: /v-venta-inmuebles/2-de-octubre/post-house-ad-from-bapi-at-2016+11+16-00-31-37-716/1001104219250910700294009
		adId = req.originalUrl.substring(req.originalUrl.lastIndexOf('/') + 1);
		req.app.locals.isSeoUrl = true;
	}

	// If no adId, redirect to homepage.
	if (adId === undefined) {
		res.redirect('/');
		return;
	}

	// If not 2.0 context, then redirect to 1.0 VIP
	if (!pageControllerUtil.is2dot0Version(res)) {
		let redirectUrl = '';
		if (req.app.locals.isSeoUrl === true) {
			redirectUrl = req.originalUrl.replace('v-', 'a-'); // redirect to 1.0 SEO version of this page
		} else {
			redirectUrl = '/view.html?adId=' + adId; // redirect to 1.0 version of this page
		}
		res.redirect(redirectUrl);
		return;
	}

	req.app.locals.pagetype = pageTypeJson.pagetype.VIP;
	let viewPageModel = new ViewPageModel(req, res, adId);
	let redirectUrl = req.query.redirect;

	viewPageModel.populateData().then((modelData) => {
		// // TODO: Check if seoVipUrl matches the originalUrl if the seoURL came in. If it doesnt, redirect to the correct seoVipUrl
		// if (this.req.app.locals.isSeoUrl === true) {
		// 	let originalSeoUrl = this.req.originalUrl;
		// 	let dataSeoVipUrl = modelData.advert.seoVipUrl;
		// 	if (originalSeoUrl !== dataSeoVipUrl) {
		// 		res.redirect(dataSeoVipUrl);
		// 		return;
		// 	}
		// }

		extendModelData(req, modelData);
		modelData.adId = adId;

		modelData.header.distractionFree = false;
		modelData.footer.distractionFree = false;
		modelData.search = true;

		modelData.redirectUrl = redirectUrl;

		pageControllerUtil.postController(req, res, next, 'viewPage/views/hbs/viewPage_', modelData);
	}).fail((err) => {
		console.error(err);
		console.error(err.stack);
		//Throw a 404 page for 404 or 401 (unauthorized). otherwise 500
		return (err.statusCode === 404 || err.statusCode === 400 || err.statusCode === 401) ? next() : next(err);
	});
});

module.exports = router;
