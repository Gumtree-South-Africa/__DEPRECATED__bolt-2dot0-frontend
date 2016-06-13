'use strict';

let express = require('express'),
    router = express.Router();

let cwd = process.cwd();

let pageControllerUtil = require(cwd + '/app/controllers/page/PageControllerUtil'),
	pagetypeJson = require(cwd + '/app/config/pagetype.json'),
	IsotopePrototypeModel = require(cwd + '/app/builders/page/IsotopePrototypeModel'),
	mockData = require(cwd + '/app/controllers/page/isotopePrototype/mockAdData');

let randomSizeClass = () => {
	let sizeClasses = [
		'two-by-one',
		'one-by-one',
		'two-by-two',
		'one-by-one',
		'one-by-one'
		],
		randomInt = Math.floor(Math.random() * 5);

	return sizeClasses[randomInt];
};

module.exports = (app) => {
	app.use('/', router);
};

router.get('/isotopePrototype', (req, res, next) => {
	console.time('Instrument-Prototype-Controller');
	req.app.locals.pagetype = pagetypeJson.pagetype.ISOTOPE_PROTOTYPE;

	let modelData = pageControllerUtil.preController(req, res);
	let model = new IsotopePrototypeModel(req, res, modelData);
	model.then((result) => {
		modelData.header = result.common.header || {};
		modelData.footer = result.common.footer || {};
		modelData.footer.javascripts.push(modelData.footer.baseJSUrl + 'common/bundles/isotope_bundle.js');
		modelData.header.containerCSS.push(modelData.header.baseCSSUrl + '/bundle.css');
		modelData.dataLayer = result.common.dataLayer || {};
		modelData.categoryData = res.locals.config.categoryflattened;
		modelData.seo = result.seo || {};

		modelData.featuredAds = mockData.featuredAds.map((ad) => {
			ad.sizeClass = 'one-by-one';
			ad.isFeatured = Math.floor(Math.random() * 10) >= 5;
			return ad;
		});

		modelData.mostRecentAds = mockData.mostRecentAds.map((ad) => {
			ad.sizeClass = randomSizeClass();
			ad.isFeatured = Math.floor(Math.random() * 10) >= 5;

			return ad;
		});

		modelData.feedTiles = mockData.feedTiles;

		pageControllerUtil.postController(req, res, next, 'isotopePrototype/views/hbs/isotopePrototype_', modelData);
	});

	console.timeEnd('Instrument-Prototype-Controller');
});
