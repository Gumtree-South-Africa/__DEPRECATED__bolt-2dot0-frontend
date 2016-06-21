'use strict';

var express = require('express'), _ = require('underscore'), router = express.Router(), Q = require('q'), cuid = require('cuid');

var cwd = process.cwd();
var pageControllerUtil = require(cwd + '/app/controllers/page/PageControllerUtil'), HomepageModel = require(cwd + '/app/builders/page/HomePageModel'), marketoService = require(cwd + '/server/utils/marketo'), Base64 = require(process.cwd() + '/app/utils/Base64'), deviceDetection = require(cwd + '/modules/device-detection'), pagetypeJson = require(cwd + '/app/config/pagetype.json'), downloadTest = require(cwd + '/app/views/components/appDownloadSection/js/appDlSection'), userService = require(process.cwd() + '/server/services/user');


module.exports = function(app) {
	app.use('/', router);
};


/**
 * Build HomePage Model Data and Render
 */
router.get('/', function(req, res, next) {
	console.time('Instrument-Homepage-Controller');

	// Set pagetype in request
	req.app.locals.pagetype = pagetypeJson.pagetype.HOMEPAGE;

	// Set anonUsrId cookie with value from cuid
	if (!req.cookies['anonUsrId']) {
		res.cookie('anonUsrId', cuid(), {'httpOnly': true});
	}

	// Build Model Data
	var modelData = pageControllerUtil.preController(req, res);
	var bapiConfigData = res.locals.config.bapiConfigData;

	// Cookies drop for Version of template
	function cookiePageVersionFn(pageVersionCookie, defaultPath, newPath, modelData) {
		if ((typeof pageVersionCookie !== 'undefined') && pageVersionCookie == '2.0') {
			pageControllerUtil.postController(req, res, next, newPath, modelData);
		} else {
			pageControllerUtil.postController(req, res, next, defaultPath, modelData);
		}
	}

	// Retrieve Data from Model Builders
	var model = HomepageModel(req, res, modelData);
	let authCookie = req.cookies['bt_auth'];
	let userCookieData = req.app.locals.userCookieData;
	let promises = [model];
	if (authCookie && !userCookieData) {
		let bapiHeaders = {
			'requestId': req.app.locals.requestId,
			'ip': req.app.locals.ip,
			'machineid': req.app.locals.machineid,
			'useragent': req.app.locals.useragent,
			'locale': res.locals.config.locale,
			'authTokenValue': authCookie
		};
		promises.push(userService.getUserFromCookie(bapiHeaders));
	}
	Q.allSettled(promises)
		.then(function(result) {

			let cookiePageVersion = req.cookies.b2dot0Version, defaultPath = 'homepage/views/hbs/homepage_', newPath = 'homepagePlaceholder/views/hbs/homepagePlaceholder_';

			let user;
			if (result[1] !== undefined) {
				//Cookie was set
				user = result[1].state === "fulfilled" ? result[1].value : null;
			}
			// Dynamic Data from BAPI
			// Result[0] is all the model data for the page without user data
			result = result[0].state === "fulfilled" ? result[0].value : null;
			modelData.isNewHP = true;
			modelData.header = result['common'].header || {};
			modelData.footer = result['common'].footer || {};
			modelData.dataLayer = result['common'].dataLayer || {};
			modelData.categoryList = _.isEmpty(result['catWithLocId']) ? modelData.category : result['catWithLocId'];
			modelData.level2Location = result['level2Loc'] || {};
			modelData.initialGalleryInfo = result['gallery'] || {};
			modelData.seo = result['seo'] || {};
			
			var startingIndex = 0 // default 0
		  , numOfAdsToSend
		  , totalNumOfAds
		  , maxIndexForAds;
	
		if(deviceDetection.isMobile()) {
			numOfAdsToSend = 1	
		}
		else{
			numOfAdsToSend = 3
		}
	
		totalNumOfAds = downloadTest.mostRecentAds.length;
		maxIndexForAds = totalNumOfAds -1;
		
		if (req.cookies['adStartingIndex']) {
			//read the startingIndex value from cookie and add by numOfAds to display
			startingIndex = parseInt (req.cookies['adStartingIndex']) + numOfAdsToSend;
		}
		
		if (startingIndex > maxIndexForAds)
		{
			startingIndex = (startingIndex % maxIndexForAds) - 1; //Index went over, so circling back to beginning.
		}
		
		res.cookie('adStartingIndex', startingIndex); // set the new value in the cookie
		
		// return three values only
		if ((startingIndex + numOfAdsToSend) <= totalNumOfAds )
		{
			modelData.dltest = downloadTest.mostRecentAds.slice(startingIndex, startingIndex + numOfAdsToSend);
		}
		else
		{
			modelData.dltest = downloadTest.mostRecentAds.slice(startingIndex, totalNumOfAds)
								.concat(downloadTest.mostRecentAds.slice(0, (numOfAdsToSend - (totalNumOfAds - startingIndex))));
		}

			if (user) {
				let userData = userService.buildProfile(user);
				_.extend(modelData.header, userData);
			} else {
				console.error(`Invalid user cookie: ${authCookie}`)
			}

			if (result['adstatistics']) {
				modelData.totalLiveAdCount = result['adstatistics'].totalLiveAds || 0;
			}

			if (result['keyword']) {
				modelData.trendingKeywords = result['keyword'][1].keywords || null;
				modelData.topKeywords = result['keyword'][0].keywords || null;
			}

			// Make the loc level 2 (Popular locations) data null if it comes as an empty
			if (_.isEmpty(modelData.level2Location)) {
				modelData.level2Location = null;
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

			// Make the location data null if it comes as an empty object from bapi
			if (_.isEmpty(modelData.location)) {
				modelData.location = null;
			}

			// Determine if we show the Popular locations container
			modelData.showPopularLocations = true;
			if (!modelData.level2Location && !modelData.location) {
				modelData.showPopularLocations = false;
			}

			// Changing Version of template depending of the cookie
			cookiePageVersionFn(cookiePageVersion, defaultPath, newPath, modelData);

			console.timeEnd('Instrument-Homepage-Controller');
		}, (err) => {
			console.error(err);
		}).fail((err) => {
		console.error(err);
	});
});


var HP = {
	/**
	 * Special header data for HomePage
	 */
	extendHeaderData: function(req, modelData) {
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
	buildHeaderPageMessages: function(req, modelData) {
		modelData.header.pageMessages = {};
		switch (req.query.status) {
			case 'userregistered' :
				modelData.header.pageMessages.success = 'home.user.registered';
				modelData.header.pageType = pagetypeJson.pagetype.USER_REGISTRATION_SUCCESS;

				// Header Marketo
				marketoService.buildMarketoDataForHP(modelData);
				if (typeof modelData.header.marketo.marketoAttributeJson !== 'undefined') {
					modelData.header.marketo.marketoAttributeJsonStr = Base64.encode(JSON.stringify(modelData.header.marketo.marketoAttributeJson));
					modelData.header.marketo.privateKeyStr = Base64.encode(JSON.stringify(modelData.header.marketo.privateKey));
				} else {
					modelData.header.marketo.marketoAttributeJsonStr = '';
				}
				break;
			case 'adinactive':
				modelData.header.pageMessages.success = 'home.ad.notyetactive';
				break;
			case 'resetpassword':
				modelData.header.pageMessages.success = 'home.reset.password.success';
				modelData.header.pageType = pagetypeJson.pagetype.PASSWORD_RESET_SUCCESS;
				break;
			case 'quickpost':
				modelData.header.pageMessages.success = 'home.quickpost.success';
				modelData.header.pageType = pagetypeJson.pagetype.PostAdSuccess;
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
	extendFooterData: function(modelData) {
		if (!modelData.footer.min) {
			var baseJSComponentDir = "/views/components/";

			modelData.footer.javascripts.push(baseJSComponentDir + 'categoryList/js/app.js');

			// @Nacer, @Videep, we are including the code for both carousels for all the countries.
			// @todo: Make sure that for AR,MX we include the CarouselExt JS files (3) and for
			// Gumtree we include adCarousel.js. This is only for DEV. for the minification files
			// it is already taken care of in jsmin.js

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
	buildContentData: function(modelData, bapiConfigData) {
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

			// Gallery See All Url
			modelData.content.seeAllUrl = homepageConfigData.adCarouselSeeAllUrl;
		}

		// Gallery AJAX
		modelData.content.galleryAdsAjaxInitUrl = '/api/ads/gallery?offset=1&limit=16';

		// Search Bar
		modelData.content.disableSearchbar = false;

		// Page Sub Title
		modelData.content.pageSubTitle = null;
	},

	/**
	 * Invoke marketo function
	 */
	deleteMarketoCookie: function(res, modelData) {
		marketoService.deleteMarketoCookie(res, modelData.header);
	}
};
