'use strict';

var express = require('express'),
    _ = require('underscore'),
    router = express.Router(),
	form = require('express-form'),
	field = form.field,
	Q = require('q');

var cwd = process.cwd();
var pageControllerUtil = require(cwd + '/app/controllers/page/PageControllerUtil'),
	QuickpostPageModel= require(cwd + '/app/builders/page/QuickpostPageModel'),
	EpsModel = require(cwd + '/app/builders/common/EpsModel'),
	pagetypeJson = require(cwd + '/app/config/pagetype.json');

var postAdService = require(cwd + '/server/services/postad');


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
		for (var i=0; i<modelData.category.children.length; i++) {
			modelData.category.children[i].selected = false;
		}

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
		field('description').trim().required().minLength(100).is(/^[a-zA-Z0-9 ]+$/),
		field('category').required().notContains('-1'),
		field('price').trim().is(/^[0-9]+$/),
		field('switch'),
		field('location'),
		field('latitude'),
		field('longitude'),
		field('address')
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
			for (var i=0; i<modelData.category.children.length; i++) {
				if (modelData.category.children[i].id === parseInt(req.form.category)) {
					modelData.category.children[i].selected = true;
				} else {
					modelData.category.children[i].selected = false;
				}
			}

			// Special Data needed for QuickPost in header, footer, content
			QuickPost.extendHeaderData(req, modelData);
			QuickPost.extendFooterData(modelData);
			QuickPost.buildFormData(modelData);
			QuickPost.buildValueData(modelData, req.form);

			if (!req.form.isValid) {
				// Handle errors
				modelData.flash = { type: 'alert-danger', errors: req.form.errors, errorMessage: req.form.errors[0] };
				pageControllerUtil.postController(req, res, next, 'quickpost/views/hbs/quickpost_', modelData);
			} else {
				// Build Ad JSON
				var adJson = QuickPost.buildAdJson(modelData, req.body);
				var ad = JSON.stringify(adJson);

				// Call BAPI to Post Ad
				Q(postAdService.quickpostAd(req.requestId, res.locals.config.locale, ad))
					.then(function (dataReturned) {
						// Redirect to VIP if successfully posted Ad
						var response = dataReturned;
						var vipLink = modelData.header.homePageUrl + response._links[0].href + '?activateStatus=adActivateSuccess';
						res.redirect(vipLink);
					}).fail(function (err) {
						// Stay on quickpost page if error during posting
						modelData.flash = { type: 'alert-danger', errors: req.form.errors };
						pageControllerUtil.postController(req, res, next, 'quickpost/views/hbs/quickpost_', modelData);
					});
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

		modelData.formContent.pagetitle = 'Sell Your Item';

		modelData.formContent.uploadText = 'Upload Pictures';

		modelData.formContent.descriptionText = 'Description';
		modelData.formContent.descriptionPlaceholder = 'Enter a short description about what you are selling (min 100 characters)';

		modelData.formContent.categoryText = 'Choose Category';

		modelData.formContent.priceText = 'Price';
		modelData.formContent.priceCurrency = 'R';
		modelData.formContent.pricePlaceholder = 'Price';
		modelData.formContent.priceExtension = '.00';

		modelData.formContent.sharefbText = 'Share on Facebook';

		modelData.formContent.locationText = 'Enter Location';

		modelData.formContent.beforeSellText = 'By Clicking \'Sell It\' you accept our Terms of Use and Posting Rules';
		modelData.formContent.sellitText = 'Sell It';

		modelData.eps = EpsModel();
	},

	/**
	 * Build Value data for QuickPost
	 */
	buildValueData: function (modelData, formData) {
		if (!_.isEmpty(formData.description)) {
			modelData.formContent.descriptionValue = formData.description;
		}
		if (!_.isEmpty(formData.category)) {
			modelData.formContent.category = formData.category;
		}
		if (!_.isEmpty(formData.price)) {
			modelData.formContent.priceValue = formData.price;
		}
		if (!_.isEmpty(formData.switch)) {
			modelData.formContent.switch = formData.switch;
		}
		if (!_.isEmpty(formData.location)) {
			modelData.formContent.location = formData.location;
		}
		if (!_.isEmpty(formData.latitude)) {
			modelData.formContent.latitude = formData.latitude;
		}
		if (!_.isEmpty(formData.longitude)) {
			modelData.formContent.longitude = formData.longitude;
		}
		if (!_.isEmpty(formData.address)) {
			modelData.formContent.address = formData.address;
		}
	},

	/**
	 * Build Ad JSON
	 */
	buildAdJson: function (modelData, requestBody) {
		var json = {};

		json.email = modelData.header.userEmail;
		json.categoryId = modelData.formContent.category;
		json.address = modelData.formContent.address;
		json.latitude = modelData.formContent.latitude;
		json.longitude = modelData.formContent.longitude;
		json.description = modelData.formContent.descriptionValue;

		json.price = {};
		json.price.currency = modelData.formContent.priceCurrency;
		json.price.amount = modelData.formContent.priceValue;

		var reqPictures = requestBody.pictures;
		json.pictures = {};
		json.pictures.sizeUrls = [];
		if (typeof reqPictures !== 'undefined') {
			for (var idx = 0; idx < reqPictures.length; idx++) {
				json.pictures.sizeUrls[idx] = {};
				json.pictures.sizeUrls[idx].LARGE = decodeURIComponent(reqPictures[idx]);
			}
		}

		return json;
	}
};
