'use strict';

var express = require('express'),
    _ = require('underscore'),
    router = express.Router(),
	form = require('express-form'),
	field = form.field;

var cwd = process.cwd();
var pageControllerUtil = require(cwd + '/app/controllers/page/PageControllerUtil'),
	QuickpostPageModel= require(cwd + '/app/builders/page/QuickpostPageModel'),
	pagetypeJson = require(cwd + '/app/config/pagetype.json');


module.exports = function (app) {
  app.use('/', router);
};


/**
 * Get QuickPost Form
 */
router.get('/quickpost', function (req, res, next) {
	console.time('Instrument-QuickPost-Form-Controller');

	// Set pagetype in request
	req.app.locals.pagetype = pagetypeJson.pagetype.PostAdForm;

	// Build Model Data
	var modelData = pageControllerUtil.preController(req, res);

	var model = QuickpostPageModel(req, res);
	model.then(function (result) {
		// Dynamic Data from BAPI
		modelData.header = result.common.header || {};
		modelData.footer = result.common.footer || {};
		modelData.dataLayer = result.common.dataLayer || {};

		// Special Data needed for QuickPost in header, footer, content
		QuickPost.extendHeaderData(req, modelData);

		pageControllerUtil.postController(req, res, next, 'quickpost/views/hbs/quickpost_', modelData);

		console.timeEnd('Instrument-QuickPost-Form-Controller');
	});
});


/**
 * Do QuickPost
 */
router.post('/quickpost',

	// Form filter and validation middleware
	form(
		field('description').trim().required().minLength(100).is(/^[a-zA-Z0-9]+$/),
		field('price').trim().is(/^[0-9]+$/)
	),

	// Express request-handler now receives filtered and validated data
	function (req, res, next) {
		console.time('Instrument-QuickPost-Data-Controller');

		// Set pagetype in request
		req.app.locals.pagetype = pagetypeJson.pagetype.PostAdSuccess;

		// Build Model Data
		var modelData = pageControllerUtil.preController(req, res);
		var model = QuickpostPageModel(req, res);
		model.then(function (result) {
			// Dynamic Data from BAPI
			modelData.header = result.common.header || {};
			modelData.footer = result.common.footer || {};
			modelData.dataLayer = result.common.dataLayer || {};

			// Special Data needed for QuickPost in header, footer, content
			QuickPost.extendHeaderData(req, modelData);

			if (!req.form.isValid) {
				// Handle errors
				console.log(req.form.errors);
				modelData.flash = { type: 'alert-danger', messages: req.form.errors };
				pageControllerUtil.postController(req, res, next, 'quickpost/views/hbs/quickpost_', modelData);
			} else {
				// Or, use filtered form data from the form object:
				console.log('Description:', req.form.description);
				console.log('Price:', req.form.price);

				// TODO: Build Ad object to POST

				// TODO: Post Ad object to service, and then to BAPI

				// Redirect to homepage with a message
				res.redirect(modelData.header.homePageUrl + '?status=quickpost');
			}

			console.timeEnd('Instrument-QuickPost-Data-Controller');
		});
	}
);


var QuickPost = {
	/**
	 * Special header data for QuickPost
	 */
	extendHeaderData: function (req, modelData) {

		// CSS
		modelData.header.pageCSSUrl = modelData.header.baseCSSUrl + 'QuickPost.css';
		if (modelData.header.min) {
			modelData.header.containerCSS.push(modelData.header.localeCSSPathHack + '/QuickPost.min.css');
		}
    	else {
			modelData.header.containerCSS.push(modelData.header.localeCSSPath + '/QuickPost.css');
		}
	},

	/**
	 * Special footer data for QuickPost
	 */
	extendFooterData: function (modelData) {

	},

	/**
	 * Build content data for QuickPost
	 */
	buildContentData: function (modelData, bapiConfigData) {
		modelData.content = {};

		// Search Bar
		modelData.content.disableSearchbar = false;

		// Page Sub Title
		modelData.content.pageSubTitle = null;
	}

};
