//jshint ignore: start
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
	var bapiConfigData = res.locals.config.bapiConfigData;
	var modelData = pageControllerUtil.preController(req, res);

	var model = QuickpostPageModel(req, res);
	model.then(function (result) {
		// Dynamic Data from BAPI
		modelData.header = result.common.header || {};
		modelData.footer = result.common.footer || {};
		modelData.dataLayer = result.common.dataLayer || {};
		modelData.categoryData = res.locals.config.categoryflattened;

    // Custom header for Post Page
    modelData.content = {};
    modelData.content.disableSearchbar = true;
    
    // Special Data needed for QuickPost in header, footer, content
		QuickPost.extendHeaderData(req, modelData);
		QuickPost.extendFooterData(modelData);
		QuickPost.buildFormData(modelData, bapiConfigData);
    console.log('disableSearchbar: ',modelData.content.disableSearchbar);
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
		field('Description').trim().required().minLength(100).is(/^[a-zA-Z0-9 ]+$/),
		field('Category').required(), field('price').trim().is(/^[0-9]+$/),
		field('switch'), field('location'), field('latitude'), field('longitude'), field('address')
	),

	// Express request-handler now receives filtered and validated data
	function (req, res, next) {
		console.time('Instrument-QuickPost-Data-Controller');

		// Get Auth Cookie
		var authCookieName = 'bt_auth';
		var authenticationCookie = req.cookies[authCookieName];

		// Set pagetype in request
		req.app.locals.pagetype = pagetypeJson.pagetype.PostAdSuccess;

		// Build Model Data
		var bapiConfigData = res.locals.config.bapiConfigData;
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
			QuickPost.buildFormData(modelData, bapiConfigData);
			QuickPost.buildValueData(modelData, req.form);

			if (!req.form.isValid) {
				// Put the errors in fieldErrors object for UI
				req.form.fieldErrors = {};
				for (var i=0; i<req.form.errors.length; i++){
				  	if (req.form.errors[i].indexOf('Category ') > -1) {
						if(!req.form.fieldErrors.category)
							req.form.fieldErrors.category = req.form.errors[i];
				  	}
				  	else if (req.form.errors[i].indexOf('Description ') > -1) {
						if(!req.form.fieldErrors.description)
							req.form.fieldErrors.description = req.form.errors[i];
				  	}
				}
				QuickPost.respondError(req,  res, next, modelData);
			} else {
				// Build Ad JSON
				var adJson = QuickPost.buildAdJson(modelData, req.body);
				var ad = JSON.stringify(adJson);

				// Call BAPI to Post Ad
				Q(postAdService.quickpostAd(req.app.locals.requestId, res.locals.config.locale, authenticationCookie, ad))
					.then(function (dataReturned) {
						// Redirect to VIP if successfully posted Ad
						var response = dataReturned;
						var vipLink = modelData.header.homePageUrl + response._links[0].href + '?activateStatus=adActivateSuccess';
						res.redirect(vipLink);
					}).fail(function (err) {
						if (err.status == 404) err.status404 = true;
						if (err.status == 500) err.status500 = true;
						// Stay on quickpost page if error during posting
						req.form.fieldErrors = {};
						req.form.fieldErrors.submit = err;
						QuickPost.respondError(req,  res, next, modelData);
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
		// image upload
	    if (!modelData.footer.min) {
			// Components
			var baseJSComponentDir = '/views/components/';
			modelData.footer.javascripts.push(baseJSComponentDir + 'mediaUpload/js/BoltImageUploadUtil.js');
			modelData.footer.javascripts.push(baseJSComponentDir + 'mediaUpload/js/BoltImageEXIF.js');
			modelData.footer.javascripts.push(baseJSComponentDir + 'mediaUpload/js/BoltImageUploadDragAndDrop.js');
			modelData.footer.javascripts.push(baseJSComponentDir + 'mediaUpload/js/BoltImageUploader.js');
			modelData.footer.javascripts.push(baseJSComponentDir + 'mapLatLong/js/mapLatLong.js');
			modelData.footer.javascripts.push(baseJSComponentDir + 'mobileSelectorMenu/js/jquery.menu.min.js');
			modelData.footer.javascripts.push(baseJSComponentDir + 'mobileSelectorMenu/js/MobileItemSelector.js');

			// Libraries
			modelData.footer.javascripts.push(modelData.footer.baseJSUrl + 'libraries/jQueryValidate/jquery.validate.min.js');

			// Page
			modelData.footer.javascripts.push(modelData.footer.baseJSUrl + 'pages/quickpost/quickpost.js');
			modelData.footer.javascripts.push(modelData.footer.baseJSUrl + 'pages/quickpost/postPageValidator.js');
		} else {
			//Todo: need to add BoltImage related to minjs
			modelData.footer.javascripts.push(modelData.footer.baseJSMinUrl + 'QuickPost_' + modelData.locale + '.min.js');
		}
	},

	/**
	 * Build Form data for QuickPost
	 */
	buildFormData: function (modelData, bapiConfigData) {
		modelData.formContent = {};

		modelData.formContent.pageTitle = 'Sell Your Item';

		modelData.formContent.uploadText = 'Upload Pictures';

		modelData.formContent.descriptionText = 'Description';
		modelData.formContent.descriptionPlaceholder = 'Enter a short description about what you are selling (min 100 characters)';

		modelData.formContent.categoryText = 'Choose Category';

		modelData.formContent.priceText = 'Price';
		modelData.formContent.priceCurrency = 'R';
		modelData.formContent.pricePlaceholder = 'Price';
		modelData.formContent.priceExtension = '.00';

		modelData.formContent.displayFb = !_.isEmpty(modelData.header.socialMedia) ? true : false;
		modelData.formContent.sharefbText = 'Share on Facebook';

		modelData.formContent.locationText = 'Enter Location';

		modelData.formContent.beforeSellText = 'By Clicking \'Sell It\' you accept our <a href=\'%s\'>Terms of Use</a> and <a href=\'%s\'>Posting Rules</a>';
		modelData.formContent.beforeSellTextTerms = bapiConfigData.footer.termOfUse;

		modelData.formContent.sellitText = 'Sell It';

		modelData.formContent.error404 = 'There is an issue with posting ads, try again later !';
		modelData.formContent.error500 = 'There is an issue with posting ads, try again later !';

		modelData.eps = EpsModel();
	},

	/**
	 * Build Value data for QuickPost
	 */
	buildValueData: function (modelData, formData) {
		if (!_.isEmpty(formData.Description)) {
			modelData.formContent.descriptionValue = formData.Description;
		}
		if (!_.isEmpty(formData.Category)) {
			modelData.formContent.category = formData.Category;
			modelData.formContent.categoryValue = modelData.categoryIdNameMap[formData.Category];
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

		json.description = modelData.formContent.descriptionValue;
		json.categoryId = modelData.formContent.category;

		json.location = {};
		json.location.address = modelData.formContent.address;
		json.location.latitude = modelData.formContent.latitude;
		json.location.longitude = modelData.formContent.longitude;

		json.ipAddress = modelData.ip;

		if (typeof modelData.formContent.priceValue !== 'undefined') {
			json.price = {};
			json.price.currency = modelData.formContent.priceCurrency;
			json.price.amount = modelData.formContent.priceValue;
		}

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
	},

	/*
	 * On Error, send back to Quickpost Form
	 */
	respondError: function (req, res, next, modelData) {
		modelData.flash = { type: 'alert-danger', errors: req.form.errors, fieldErrors: req.form.fieldErrors};

		if (req.form.fieldErrors.submit) {
			modelData.header.pageMessages = {};

			var errorMessage = '';
			if (req.form.fieldErrors.submit.status404) {
				errorMessage = modelData.formContent.error404;
			}
			if (req.form.fieldErrors.submit.status500) {
				errorMessage = modelData.formContent.error500;
			}
			modelData.header.pageMessages.error = errorMessage;
		}

		pageControllerUtil.postController(req, res, next, 'quickpost/views/hbs/quickpost_', modelData);
	}
};
