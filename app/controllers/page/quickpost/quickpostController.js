//jshint ignore: start
'use strict';

var express = require('express'),
    _ = require('underscore'),
    router = express.Router(),
	form = require('express-form'),
	field = form.field,
	Q = require('q');

var cwd = process.cwd();
var StringUtils = require(cwd + '/app/utils/StringUtils'),
	pageControllerUtil = require(cwd + '/app/controllers/page/PageControllerUtil'),
	QuickpostPageModel= require(cwd + '/app/builders/page/QuickpostPageModel'),
	EpsModel = require(cwd + '/app/builders/common/EpsModel'),
	pagetypeJson = require(cwd + '/app/config/pagetype.json');

var postAdService = require(cwd + '/server/services/postad');
var fbGraphService = require(cwd + '/server/utils/fbgraph');

module.exports = function (app) {
  app.use('/', router);
};


/**
 * Get QuickPost Form
 */
router.get('/quickpost', function (req, res, next) {
	console.time('Instrument-QuickPost-Form-Controller');

  // Set pagetype in request
	req.app.locals.pagetype = pagetypeJson.pagetype.QUICK_POST_AD_FORM;

	// Build Model Data
	var bapiConfigData = res.locals.config.bapiConfigData;
	var modelData = pageControllerUtil.preController(req, res);

	var model = QuickpostPageModel(req, res, modelData);
	model.then(function (result) {

  	// Dynamic Data from BAPI
		modelData.header = result.common.header || {};
		modelData.footer = result.common.footer || {};
		modelData.dataLayer = result.common.dataLayer || {};
		modelData.categoryData = res.locals.config.categoryflattened;
		modelData.seo = result['seo'] || {};

    // Special Data needed for QuickPost in header, footer, content
		QuickPost.extendHeaderData(req, modelData);
		QuickPost.extendFooterData(modelData);
		QuickPost.buildFormData(modelData, bapiConfigData);

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
		field('Description').trim().required().minLength(10).maxLength(4096)
			.is(/^[\s|\w|\d|&|;|\,|\.|\\|\+|\*|\?|\[|\^|\]|\$|\(|\)|\{|\}|\=|\!|\||\:|\-|\_|\^|\#|\@|\%|\~|\`|\=|\'|\"|\/|<b>|<\/b>|<i>|<\/i>|<li>|<\/li>|<p>|<\/p>|<br>|<ol>|<\/ol>|<u>|<\/u>|<ul>|<\/ul>|<div>|<\/div>)]+$/),
		field('Category').required(),
		field('price').trim().maxLength(10).is(/^[0-9]+$/),field('SelectedCurrency'),
		field('switch'),
		field('Location').required().is(/^[\s|\w|\d|\-|\,|)]+$/), field('latitude'), field('longitude'), field('address')

	),

	// Express request-handler now receives filtered and validated data
	function (req, res, next) {
		console.time('Instrument-QuickPost-Data-Controller');

		// Get Auth Cookie
		var authCookieName = 'bt_auth';
		var authenticationCookie = req.cookies[authCookieName];

		// Set pagetype in request
		req.app.locals.pagetype = pagetypeJson.pagetype.QUICK_POST_AD_FORM;

		// Build Model Data
		var bapiConfigData = res.locals.config.bapiConfigData;
		var modelData = pageControllerUtil.preController(req, res);
		var model = QuickpostPageModel(req, res, modelData);
		model.then(function (result) {
			// Dynamic Data from BAPI
			modelData.header = result.common.header || {};
			modelData.footer = result.common.footer || {};
			modelData.dataLayer = result.common.dataLayer || {};
			modelData.categoryData = res.locals.config.categoryflattened;
			modelData.seo = result['seo'] || {};

			// Special Data needed for QuickPost in header, footer, content
			QuickPost.extendHeaderData(req, modelData);
			QuickPost.extendFooterData(modelData);
			QuickPost.buildFormData(modelData, bapiConfigData);
			QuickPost.buildValueData(modelData, req.form);

			if (!req.form.isValid) {
				QuickPost.respondFieldError(req, res, next, modelData);
			} else {
				// Build Ad JSON
				var adJson = QuickPost.buildAdJson(modelData, req.body);
				var ad = JSON.stringify(adJson);

				// Call BAPI to Post Ad
				Q(postAdService.quickpostAd(modelData.bapiHeaders, ad))
					.then(function (dataReturned) {
						var response = dataReturned;
						modelData.dataLayer.pageData.pageType = pagetypeJson.pagetype.QUICK_POST_AD_SUCCESS;

						for (var l=0;l<response._links.length; l++) {
							if (response._links[l].rel == 'view') {
								var fbShareLink = modelData.header.homePageUrl + response._links[l].href;
								var vipLink = modelData.header.homePageUrl + response._links[l].href + '?activateStatus=adActivateSuccess';

								// Post to FB if share button is enabled
								if (typeof req.form.switch!=='undefined' && req.form.switch=='YES') {
									var msg = modelData.formContent.fbPublishMsg + ' ' + fbShareLink;
									Q(fbGraphService.publishPost(modelData.header.publishPostUrl, msg, fbShareLink))
										.then(function (fbDataReturned) {
											console.log('Successful FB Graph PublishPost', fbDataReturned);
										})
										.fail(function (err) {
											console.error('Error during FB Graph PublishPost', err);
										});
								}

								// Redirect to VIP
								res.redirect(vipLink);
							}
						}
					}).fail(function (err) {
						QuickPost.respondSubmitError(req,  res, next, modelData, err);
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
		// SEO
		modelData.header.pageType = modelData.pagename;
		modelData.header.pageTitle = modelData.seo.pageTitle;
		modelData.header.metaDescription = modelData.seo.description;

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
		// Post Form
		modelData.formContent = {};

		modelData.formContent.pageTitle = 'quickpost.pageTitle';

		modelData.formContent.descriptionText = 'quickpost.descriptionText';
		modelData.formContent.descriptionPlaceholder = 'quickpost.descriptionPlaceholder';
		modelData.formContent.descriptionTipTitle = 'quickpost.descriptionTipTitle';
		modelData.formContent.descriptionTip1 = 'quickpost.descriptionTip1';
		modelData.formContent.descriptionTip2 = 'quickpost.descriptionTip2';
		modelData.formContent.descriptionTip3 = 'quickpost.descriptionTip3';
		modelData.formContent.descriptionTip4 = 'quickpost.descriptionTip4';
    modelData.formContent.descriptionValue = 'quickpost.empty';

    modelData.formContent.categoryText = 'quickpost.categoryText';

		modelData.formContent.pricePlaceholder = 'quickpost.pricePlaceholder';
		modelData.formContent.priceCurrency = 'quickpost.priceCurrency';
		modelData.formContent.priceCurrencyText = 'quickpost.priceCurrencyText';
		modelData.formContent.priceCurrencyDisplay = 'quickpost.priceCurrencyDisplay';
		modelData.formContent.priceExtension = 'quickpost.priceExtension';
		modelData.formContent.currencyDisplay=bapiConfigData.content.quickpost.currencyDisplay;
        modelData.formContent.currency=bapiConfigData.content.quickpost.currency;
		if (modelData.formContent.currency.length == 1) {
			var singleCurrency = modelData.formContent.currency[0];
			var singleCurrencySplit = singleCurrency.split(':');
			modelData.formContent.selectedCurrency = singleCurrencySplit[1];
		}

    modelData.formContent.categoryValue= 'quickpost.empty';

    modelData.formContent.priceValue = 'quickpost.empty';

    modelData.formContent.displayFb = !_.isEmpty(modelData.header.socialMedia) ? true : false;
		modelData.formContent.sharefbText = 'quickpost.sharefbText';
		modelData.formContent.sharefbTextYes = 'quickpost.sharefbTextYes';
		modelData.formContent.sharefbTextNo = 'quickpost.sharefbTextNo';

		modelData.formContent.locationText = 'quickpost.locationText';
		modelData.formContent.geolocation1 = 'quickpost.geolocation1';
		modelData.formContent.geolocation2 = 'quickpost.geolocation2';

		modelData.formContent.beforeSellText = 'quickpost.beforeSellText';
		modelData.formContent.beforeSellTextTerms = 'quickpost.beforeSellTextTerms';
		modelData.formContent.beforeSellTextTermsUrl = bapiConfigData.footer.termOfUse;
		modelData.formContent.beforeSellTextAnd = 'quickpost.beforeSellTextAnd';
		modelData.formContent.beforeSellTextPostingRules = 'quickpost.beforeSellTextPostingRules';
		modelData.formContent.beforeSellTextPostingRulesUrl = bapiConfigData.footer.postingRules;

		modelData.formContent.sellitText = 'quickpost.sellitText';
		modelData.formContent.fbPublishMsg = 'quickpost.fbPublishMsg';

		modelData.formContent.error4xx = 'quickpost.error.4xx';
		modelData.formContent.error5xx = 'quickpost.error.5xx';
		modelData.formContent.errorDescriptionReqd = 'quickpost.error.descriptionReqd';
		modelData.formContent.errorDescriptionShort = 'quickpost.error.descriptionShort';
		modelData.formContent.errorDescriptionLong = 'quickpost.error.descriptionLong';
		modelData.formContent.errorDescriptionInvalid = 'quickpost.error.descriptionInvalid';
		modelData.formContent.errorCategoryReqd = 'quickpost.error.categoryReqd';
		modelData.formContent.errorCategoryInvalid = 'quickpost.error.categoryInvalid';
		modelData.formContent.errorLocationReqd = 'quickpost.error.locationReqd';
		modelData.formContent.errorLocationInvalid = 'quickpost.error.locationInvalid';
		modelData.formContent.errorLocNotInCountry = 'quickpost.error.locationNotInCountry';
		modelData.formContent.errorPriceLong = 'quickpost.error.priceLong';

		// Custom header
		modelData.content = {};
		modelData.content.disableSearchbar = true;


		// EPS
		modelData.eps = EpsModel();
	},

	/**
	 * Build Value data for QuickPost
	 */
	buildValueData: function (modelData, formData) {
		if (!_.isEmpty(formData.Description)) {
			var desc = formData.Description;
			desc = StringUtils.unescapeHtml(desc);
			desc = StringUtils.unescapeUrl(desc);
			desc = StringUtils.unescapeEmail(desc);
			desc = StringUtils.fixNewline(desc);
			desc = StringUtils.stripComments(desc);
			modelData.formContent.descriptionValue = desc;
			modelData.formContent.descriptionLength = 4096 - modelData.formContent.descriptionValue.length;
		}
		if (!_.isEmpty(formData.Category)) {
			modelData.formContent.category = formData.Category;
			modelData.formContent.categoryValue = modelData.categoryIdNameMap[formData.Category];
		}
		if (!_.isEmpty(formData.price)) {
			modelData.formContent.priceValue = formData.price;
		}
		if (!_.isEmpty(formData.SelectedCurrency)) {
			modelData.formContent.selectedCurrency = formData.SelectedCurrency;
		}
		if (!_.isEmpty(formData.switch)) {
			if (formData.switch == 'YES') {
				modelData.formContent.checked = true;
				modelData.formContent.switch = formData.switch;
			}
		}
		if (!_.isEmpty(formData.Location)) {
			modelData.formContent.location = formData.Location;
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
			json.price.currency = modelData.formContent.selectedCurrency;
			json.price.amount = modelData.formContent.priceValue;
		}

		var reqPictures = requestBody.pictures;
		json.pictures = {};
		json.pictures.sizeUrls = [];
		if (typeof reqPictures !== 'undefined') {
			if (_.isArray(reqPictures)) {
				for (var idx = 0; idx < reqPictures.length; idx++) {
					json.pictures.sizeUrls[idx] = {};
					json.pictures.sizeUrls[idx].LARGE = decodeURIComponent(reqPictures[idx]);
				}
			} else {
				json.pictures.sizeUrls[0] = {};
				json.pictures.sizeUrls[0].LARGE = decodeURIComponent(reqPictures);
			}
		}

		return json;
	},

	/*
	 * On Field Validation Error, send back to Quickpost Form
	 */
	respondFieldError: function(req, res, next, modelData) {
		req.form.fieldErrors = {};
		for (var i=0; i<req.form.errors.length; i++){
			if (req.form.errors[i].indexOf('Description ') > -1) {
				if(!req.form.fieldErrors.description)
					req.form.fieldErrors.description = req.form.errors[i];
			} else if (req.form.errors[i].indexOf('Category ') > -1) {
				if(!req.form.fieldErrors.category)
					req.form.fieldErrors.category = req.form.errors[i];
			}
			else if (req.form.errors[i].indexOf('price') > -1) {
				if(!req.form.fieldErrors.price)
                    req.form.fieldErrors.price = req.form.errors[i];
			}
			else if (req.form.errors[i].indexOf('Location ') > -1) {
				if(!req.form.fieldErrors.location)
					req.form.fieldErrors.location = req.form.errors[i];
			}
		}

		modelData.flash = { type: 'alert-danger', errors: req.form.errors, fieldErrors: req.form.fieldErrors};
		modelData.dataLayer.pageData.pageType = pagetypeJson.pagetype.QUICK_POST_AD_ERROR;

		pageControllerUtil.postController(req, res, next, 'quickpost/views/hbs/quickpost_', modelData);
	},

	/*
	 * On Page Submit Error, send back to Quickpost Form
	 */
	respondSubmitError: function (req, res, next, modelData, err) {
		console.log('errorrrrrrrrrrrrrrrrrrrrrr', err);

		var errorCode = parseInt(err.status);
		if (errorCode >= 400 && errorCode < 500) err.status4xx = true;
		if (errorCode >= 500 && errorCode < 600) err.status5xx = true;

		var errorMessage = '';
		if (err.status4xx) {
			if (errorCode == 400 ) {
				var fieldError = 'false';
				for(var i=0; i<err.details.length; i++) {
					var det = err.details[i];
					if (det.code == 'LOCATION_DOES_NOT_MATCH_COUNTRY') {
						req.form.fieldErrors = {};
						req.form.fieldErrors.location = modelData.formContent.errorLocNotInCountry;
						fieldError = 'true';
					} else if (det.message.indexOf('Param:latitude') > '-1' && det.code=='MISSING_PARAM') {
						req.form.fieldErrors = {};
						req.form.fieldErrors.location = modelData.formContent.errorLocationInvalid;
						fieldError = 'true';
					} else if (det.message.indexOf('Param:longitude') > '-1' && det.code=='MISSING_PARAM') {
						req.form.fieldErrors = {};
						req.form.fieldErrors.location = modelData.formContent.errorLocationInvalid;
						fieldError = 'true';
					} else if (det.message.indexOf('Param:address') > '-1' && det.code=='MISSING_PARAM') {
						req.form.fieldErrors = {};
						req.form.fieldErrors.location = modelData.formContent.errorLocationInvalid;
						fieldError = 'true';
					} else if (det.code == 'INVALID_PARAM_DESCRIPTION_LENGTH') {
						req.form.fieldErrors = {};
						req.form.fieldErrors.description = modelData.formContent.errorDescriptionInvalid;
						fieldError = 'true';
					} else if (det.code == 'CATEGORYID_NOT_FOUND_FOR_THIS_LOCALE') {
						req.form.fieldErrors = {};
						req.form.fieldErrors.category = modelData.formContent.errorCategoryInvalid;
						fieldError = 'true';
					}
				}
			}
			if (_.isEmpty(errorMessage) && fieldError=='false') {
				errorMessage = modelData.formContent.error4xx;
			} else {
				modelData.flash = { type: 'alert-danger', errors: req.form.errors, fieldErrors: req.form.fieldErrors};
			}
		}
		if (err.status5xx) {
			errorMessage = modelData.formContent.error5xx;
		}

		if (!_.isEmpty(errorMessage)) {
			modelData.header.pageMessages = {};
			modelData.header.pageMessages.error = errorMessage;
			modelData.dataLayer.pageData.pageType = pagetypeJson.pagetype.QUICK_POST_AD_ERROR;
		}

		pageControllerUtil.postController(req, res, next, 'quickpost/views/hbs/quickpost_', modelData);
	}
};
