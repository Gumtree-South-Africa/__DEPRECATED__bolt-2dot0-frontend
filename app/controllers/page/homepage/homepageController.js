//jshint ignore: start
'use strict';

var express = require('express'),
    _ = require('underscore'),
    router = express.Router(),
    util = require('util'),
    i18n = require('i18n'),
    cuid = require('cuid');

var cwd = process.cwd();
var pageControllerUtil = require(cwd + '/app/controllers/page/PageControllerUtil'),
	HomepageModel= require(cwd + '/app/builders/page/HomePageModel'),
	marketoService = require(cwd + '/server/utils/marketo'),
	deviceDetection = require(cwd + '/modules/device-detection'),
	pagetypeJson = require(cwd + '/app/config/pagetype.json');


module.exports = function (app) {
  app.use('/', router);
};


/**
 * Build HomePage Model Data and Render
 */
router.get('/', function (req, res, next) {
	console.time('Instrument-Homepage-Controller');

	// Set pagetype in request
	req.app.locals.pagetype = pagetypeJson.pagetype.HOMEPAGE;

	// Set anonUsrId cookie with value from cuid
	if (!req.cookies['anonUsrId']) {
		res.cookie('anonUsrId', cuid());
	}

	// Build Model Data
	var modelData = pageControllerUtil.getInitialModelData(req, res);
	var bapiConfigData = res.locals.config.bapiConfigData;

	// Retrieve Data from Model Builders
	var model = HomepageModel(req, res);
    model.then(function (result) {
      	// Dynamic Data from BAPI
      	modelData.header = result['common'].header || {};
		modelData.footer = result['common'].footer || {};
		modelData.dataLayer = result['common'].dataLayer || {};
		modelData.categoryList = _.isEmpty(result['catWithLocId']) ? modelData.category : result['catWithLocId'];
		modelData.level2Location = result['level2Loc'] || {};
		modelData.initialGalleryInfo = result['gallery'] || {};
		modelData.seo = result['seo'] || {};
		if (result['adstatistics']) {
			modelData.totalLiveAdCount = result['adstatistics'].totalLiveAds || {};
		}
		if (result['keyword']) {
			modelData.trendingKeywords = result['keyword'][0].keywords || {};
			modelData.topKeywords = result['keyword'][1].keywords || {};
		}

		// Check for top or trending keywords existence
		modelData.topOrTrendingKeywords = false;
		if (modelData.trendingKeywords || modelData.topKeywords) {
			modelData.topOrTrendingKeywords = true;
		}

		// Special Data needed for HomePage in header, footer, content
		HP.extendHeaderData(req, modelData);
		HP.extendFooterData(modelData);
		HP.buildContentData(modelData, bapiConfigData);
		HP.deleteMarketoCookie(res, modelData);

		pageControllerUtil.finalizeController(req, res, next, 'homepage/views/hbs/homepage_', modelData);

		console.timeEnd('Instrument-Homepage-Controller');
    });
});


var HP = {
	/**
	 * Special header data for HomePage
	 */
	extendHeaderData: function (req, modelData) {
		// SEO
		modelData.header.pageType = modelData.pagename;
		modelData.header.pageTitle = modelData.seo.pageTitle;
		modelData.header.metaDescription = modelData.seo.description; //TODO check if descriptionCat needed based on locale, and put that value
		modelData.header.metaRobots = modelData.seo.robots;
		modelData.header.canonical = modelData.header.homePageUrl;
		modelData.header.pageUrl = modelData.header.homePageUrl;
		if (modelData.header.seoDeepLinkingBaseUrlAndroid) {
			modelData.header.seoDeeplinkingUrlAndroid = modelData.header.seoDeepLinkingBaseUrlAndroid + 'home';
		}

		// CSS
		modelData.header.pageCSSUrl = modelData.header.baseCSSUrl + 'HomePage.css';
		if (modelData.header.min) {
			if (deviceDetection.isHomePageDevice()) {
				modelData.header.containerCSS.push(modelData.header.localeCSSPathHack + '/HomePageHack.min.css');
			} else {
				modelData.header.containerCSS.push(modelData.header.localeCSSPath + '/HomePage.min.css');
			}
		} else {
			if (deviceDetection.isHomePageDevice()) {
				modelData.header.containerCSS.push(modelData.header.localeCSSPathHack + '/HomePageHack.css');
			} else {
				modelData.header.containerCSS.push(modelData.header.localeCSSPath + '/HomePage.css');
			}
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
				modelData.header.pageType = '';
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
		var baseJSComponentDir = "/views/components/";

		modelData.footer.pageJSUrl = modelData.footer.baseJSUrl + 'HomePage.js';
		if (!modelData.footer.min) {
			modelData.footer.javascripts.push(baseJSComponentDir + 'categoryList/js/app.js');
			if (!modelData.header.enableLighterVersionForMobile) {
				modelData.footer.javascripts.push(baseJSComponentDir + 'countryMap/js/Map.js');
				modelData.footer.javascripts.push(baseJSComponentDir + 'adCarousel/js/CarouselExt/modernizr.js');
				modelData.footer.javascripts.push(baseJSComponentDir + 'adCarousel/js/CarouselExt/owl.carousel.js');
				modelData.footer.javascripts.push(baseJSComponentDir + 'adCarousel/js/CarouselExt/carouselExt.js');
			}
			var availableAdFeatures = modelData.footer.availableAdFeatures;
			if (typeof availableAdFeatures !== 'undefined') {
				for (var i = 0; i < availableAdFeatures.length; i++) {
					if (availableAdFeatures[i] === 'HOME_PAGE_GALLERY') {
						modelData.footer.javascripts.push(baseJSComponentDir + 'adCarousel/js/adCarousel.js');
					}
				}
			}
		} else {
			if (modelData.header.enableLighterVersionForMobile) {
				modelData.footer.javascripts.push(modelData.footer.baseJSMinUrl + 'HomePage_' + modelData.locale + '_light.min.js');
			} else {
				modelData.footer.javascripts.push(modelData.footer.baseJSMinUrl + 'HomePage_' + modelData.locale + '.min.js');
			}
		}
	},

	/**
	 * Build content data for HomePage
	 */
	buildContentData: function (modelData, bapiConfigData) {
		modelData.content = {};

		var contentConfigData, homepageConfigData;
		if (typeof bapiConfigData !== 'undefined') {
			contentConfigData = bapiConfigData.content;
		}
		if (typeof contentConfigData !== 'undefined') {
			homepageConfigData = contentConfigData.homepage;
		}
		if (typeof homepageConfigData !== 'undefined') {
			// Banners
			modelData.content.topHomePageAdBanner = homepageConfigData.topHomePageAdBanner;

			if (homepageConfigData.homepageBanners !== null) {
				var homePageBannerUrls = [];
				var homepageBanners = homepageConfigData.homepageBanners;
				for (var i = 0; i < homepageBanners.length; i++) {
					homePageBannerUrls[i] = modelData.footer.baseImageUrl + homepageBanners[i];
				}
				modelData.content.homePageBannerUrl = homePageBannerUrls[Math.floor(Math.random() * homePageBannerUrls.length)];
			}

			// Swap Trade
			if (homepageConfigData.swapTradeEnabled) {
				modelData.content.swapTradeModel = {};
				modelData.content.swapTradeModel.isSwapTradeEnabled = homepageConfigData.swapTradeEnabled;
				modelData.content.swapTradeModel.swapTradeName = homepageConfigData.swapTradeName;
				modelData.content.swapTradeModel.swapTradeSeoUrl = homepageConfigData.swapTradeUrl;
			}

			// Freebies
			if (homepageConfigData.freebiesEnabled) {
				modelData.content.freebiesModel = {};
				modelData.content.freebiesModel.isFreebiesEnabled = homepageConfigData.freebiesEnabled;
				modelData.content.freebiesModel.freebiesName = homepageConfigData.freebiesName;
				modelData.content.freebiesModel.freebiesSeoUrl = homepageConfigData.freebiesUrl;
			}

			// Bing Meta
			modelData.content.bingMeta = homepageConfigData.bingMeta;
		}

		// Gallery
		modelData.content.seeAllUrl = 's-all-the-ads/v1b0p1?fe=2';
		modelData.content.galleryAdsAjaxInitUrl ='/api/ads/gallery?offset=1&limit=16';

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
