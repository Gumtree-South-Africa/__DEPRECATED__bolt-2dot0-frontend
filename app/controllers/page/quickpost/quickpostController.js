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
		QuickPost.extendFooterData(modelData);
		QuickPost.buildFormData(modelData);

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
			QuickPost.extendFooterData(modelData);
			QuickPost.buildFormData(modelData);
			QuickPost.buildValueData(modelData, req.form);


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
		var baseJSComponentDir = '/views/components/';

		// image upload
	    if (!modelData.footer.min) {
			modelData.footer.javascripts.push(baseJSComponentDir + 'mediaUpload/js/BoltImageUploadUtil.js');
			modelData.footer.javascripts.push(baseJSComponentDir + 'mediaUpload/js/BoltImageEXIF.js');
			modelData.footer.javascripts.push(baseJSComponentDir + 'mediaUpload/js/BoltImageUploadDragAndDrop.js');
			modelData.footer.javascripts.push(baseJSComponentDir + 'mediaUpload/js/BoltImageUploader.js');
		} else {
			//Todo: need to add BoltImage related to minjs
			modelData.footer.javascripts.push(modelData.footer.baseJSMinUrl + 'QuickPost' + modelData.locale + '.min.js');
		}
	},

	/**
	 * Build Form data for QuickPost
	 */
	buildFormData: function (modelData) {
		modelData.formContent = {};

		modelData.formContent.uploadText = 'Upload Pictures';

		modelData.formContent.descriptionText = 'Description';
		modelData.formContent.descriptionValue = 'Enter a short description about what you are selling';

		modelData.formContent.categoryText = 'Select Category';

		modelData.formContent.priceText = 'Price';

		modelData.formContent.sharefbText = 'Share on Facebook';

		modelData.formContent.sellitText = 'Sell It';
		
		//modelData.eps = 
	},

	/**
	 * Build Value data for QuickPost
	 */
	buildValueData: function (modelData, formData) {
		if (!_.isEmpty(formData.description)) {
			modelData.formContent.descriptionValue = formData.description;
		}
		if (!_.isEmpty(formData.price)) {
			modelData.formContent.priceValue = formData.price;
		}
	}
};
