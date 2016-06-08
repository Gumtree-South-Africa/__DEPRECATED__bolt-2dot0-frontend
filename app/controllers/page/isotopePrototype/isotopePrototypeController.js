'use strict';

let express = require('express'),
    router = express.Router();

let cwd = process.cwd();

let pageControllerUtil = require(cwd + '/app/controllers/page/PageControllerUtil'),
	pagetypeJson = require(cwd + '/app/config/pagetype.json');

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
		modelData.dataLayer = result.common.dataLayer || {};
		modelData.categoryData = res.locals.config.categoryflattened;
		modelData.seo = result.seo || {};

		modelData.featuredAds = [
			{
				sizeClass: 'one-by-one'
			},
			{
				sizeClass: 'one-by-one'
			},
			{
				sizeClass: 'one-by-one'
			},
			{
				sizeClass: 'one-by-one'
			},
			{
				sizeClass: 'one-by-one'
			},
			{
				sizeClass: 'two-by-one'
			},
			{
				sizeClass: 'two-by-one'
			},
			{
				sizeClass: 'two-by-one'
			},
			{
				sizeClass: 'two-by-one'
			},
			{
				sizeClass: 'two-by-one'
			},
			{
				sizeClass: 'one-by-two'
			},
			{
				sizeClass: 'one-by-two'
			},
			{
				sizeClass: 'one-by-two'
			},
			{
				sizeClass: 'one-by-two'
			},
			{
				sizeClass: 'one-by-two'
			},
			{
				sizeClass: 'one-by-two'
			},
			{
				sizeClass: 'one-by-two'
			},
			{
				sizeClass: 'two-by-two'
			},
			{
				sizeClass: 'two-by-two'
			},
			{
				sizeClass: 'two-by-two'
			}
		];

		pageControllerUtil.postController(req, res, next, 'isotopePrototype/views/hbs/isotopePrototype_', modelData);
	});

	console.timeEnd('Instrument-Prototype-Controller');
});
