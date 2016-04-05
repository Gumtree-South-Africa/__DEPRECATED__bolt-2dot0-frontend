//jshint ignore: start
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
 * Build QuickPost Form
 */
router.get('/quickpost', function (req, res, next) {
	console.time('Instrument-QuickPost-Form-Controller');

	// Set pagetype in request
	req.app.locals.pagetype = pagetypeJson.pagetype.PostAdForm;

	// Build Model Data
	var modelData = pageControllerUtil.preController(req, res);
	var bapiConfigData = res.locals.config.bapiConfigData;

	// Retrieve Data from Model Builders
	var model = QuickpostPageModel(req, res);
	model.then(function (result) {
		// Dynamic Data from BAPI
		modelData.header = result['common'].header || {};
		modelData.footer = result['common'].footer || {};
		modelData.dataLayer = result['common'].dataLayer || {};

    // Special Data needed for HomePage in header, footer, content
    HP.extendHeaderData(req, modelData);

		pageControllerUtil.postController(req, res, next, 'quickpost/views/hbs/quickpost_', modelData);
	});

	console.timeEnd('Instrument-QuickPost-Form-Controller');
});


/**
 * Build QuickPost Model After Post
 */
router.post('/quickpost',

	// Form filter and validation middleware
	form(
		field("description").trim().required().is(/^[a-z]+$/),
		field("price").trim().required().is(/^[0-9]+$/)
	),

	// Express request-handler now receives filtered and validated data
	function (req, res, next) {
		console.time('Instrument-QuickPost-Data-Controller');

		// Set pagetype in request
		req.app.locals.pagetype = pagetypeJson.pagetype.PostAdSuccess;

		// Build Model Data
		var modelData = pageControllerUtil.preController(req, res);
		var bapiConfigData = res.locals.config.bapiConfigData;

		// TODO: Post Form
		if (!req.form.isValid) {
			// Handle errors
			console.log(req.form.errors);

		} else {
			// Or, use filtered form data from the form object:
			console.log("Description:", req.form.description);
			console.log("Price:", req.form.price);
		}

		pageControllerUtil.postController(req, res, next, 'homepage/views/hbs/quickpost_', modelData);

		console.timeEnd('Instrument-QuickPost-Data-Controller');
	}
);



var HP = {
	/**
	 * Special header data for HomePage
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

		// Header Page Messages
		HP.buildHeaderPageMessages(req, modelData);
	},

	/**
	 * Build Page-Messages data for HomePage
	 */
	buildHeaderPageMessages: function (req, modelData) {
		modelData.header.pageMessages = {};
		switch (req.query.status) {
			case 'userregistered' :
				modelData.header.pageMessages.success = 'home.user.registered';
				modelData.header.pageType = pagetypeJson.pagetype.USER_REGISTRATION_SUCCESS;

				// Header Marketo
				marketoService.buildMarketoDataForHP(modelData);
				break;
			case 'adinactive':
				modelData.header.pageMessages.success = 'home.ad.notyetactive';
				break;
			case 'resetpassword':
				modelData.header.pageMessages.success = 'home.reset.password.success';
				modelData.header.pageType = pagetypeJson.pagetype.PASSWORD_RESET_SUCCESS;
				break;
			default:
				modelData.header.pageMessages.success = '';
				modelData.header.pageMessages.error = '';
		}
		switch (req.query.resumeabandonedordererror) {
			case 'adnotactive':
				modelData.header.pageMessages.error = 'abandonedorder.adNotActive';
				break;
			case 'adfeaturepaid':
				modelData.header.pageMessages.error = 'abandonedorder.adFeaturePaid.multiple_ads';
				break;
		}
	},

	/**
	 * Special footer data for HomePage
	 */
	extendFooterData: function (modelData) {

	},

	/**
	 * Build content data for HomePage
	 */
	buildContentData: function (modelData, bapiConfigData) {
		modelData.content = {};

		// Bing Meta
		modelData.content.bingMeta = homepageConfigData.bingMeta;

		// Search Bar
		modelData.content.disableSearchbar = false;

		// Page Sub Title
		modelData.content.pageSubTitle = null;
	},

	/**
	 * Invoke marketo function
	 */
	deleteMarketoCookie: function (res, modelData) {
		marketoService.deleteMarketoCookie(res, modelData.header);
	}
};
