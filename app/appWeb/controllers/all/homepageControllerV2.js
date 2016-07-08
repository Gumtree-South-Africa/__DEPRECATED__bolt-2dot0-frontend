'use strict';

let cuid = require('cuid');
let _ = require('underscore');

let cwd = process.cwd();
let pageControllerUtil = require(cwd + '/app/appWeb/controllers/all/PageControllerUtil');
let HomepageModel = require(cwd + '/app/builders/page/HomePageModelV2');
let marketoService = require(cwd + '/server/utils/marketo');
let Base64 = require(process.cwd() + '/app/utils/Base64');
let deviceDetection = require(cwd + '/modules/device-detection');
let pagetypeJson = require(cwd + '/app/config/pagetype.json');


let HP = {
	/**
	 * Special header data for HomePage
	 */
	extendHeaderData: (req, modelData) => {
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
	buildHeaderPageMessages: (req, modelData) => {
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
			default:
				break;
		}
	},

	/**
	 * Special footer data for HomePage
	 */
	extendFooterData: (modelData) => {
		if (!modelData.footer.min) {
			let baseJSComponentDir = '/views/components/';

			// todo: keep this for V2
			modelData.footer.javascripts.push(modelData.footer.baseJSMinUrl + "homepageV2Bundle.js");
			// end of V2

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

			let availableAdFeatures = modelData.footer.availableAdFeatures;
			if (typeof availableAdFeatures !== 'undefined') {
				for (let i = 0; i < availableAdFeatures.length; i++) {
					if (availableAdFeatures[i] === 'HOME_PAGE_GALLERY') {
						modelData.footer.javascripts.push(baseJSComponentDir + 'adCarousel/js/adCarousel.js');
					}
				}
			}
		} else {
			modelData.footer.javascripts.push(modelData.footer.baseJSMinUrl + "homepageV2Bundle.js");
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
	buildContentData: (modelData, bapiConfigData) => {
		modelData.content = {};

		let contentConfigData, homepageConfigData;
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
				let homePageBannerUrls = [];
				let homepageBanners = homepageConfigData.homepageBanners;
				for (let i = 0; i < homepageBanners.length; i++) {
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
	deleteMarketoCookie: (res, modelData) => {
		marketoService.deleteMarketoCookie(res, modelData.header);
	}
};

/**
 * Build HomePage Model Data and Render
 */

module.exports = (req, res, next) => {
	if (!req.cookies['anonUsrId']) {
		res.cookie('anonUsrId', cuid(), {'httpOnly': true});
	}
	let modelData = pageControllerUtil.preController(req, res);
	// Retrieve Data from Model Builders
	req.app.locals.pagetype = pagetypeJson.pagetype.HOMEPAGEV2;
	
	//Used to disable/enable distraction free. Default is false.
	req.app.locals.distractionFree = req.cookies.distractionFree === 'true';
	
	let homepage = new HomepageModel(req, res, modelData);
	let model = homepage.populateData();

	model.then((result) => {
		let bapiConfigData = res.locals.config.bapiConfigData;

		modelData = _.extend(modelData, result);
		modelData.header = result['common'].header || {};
		modelData.footer = result['common'].footer || {};
		modelData.dataLayer = result['common'].dataLayer || {};
		modelData.seo = result['seo'] || {};
		modelData.isNewHP = true;

		HP.extendHeaderData(req, modelData);
		HP.extendFooterData(modelData);
		HP.buildContentData(modelData, bapiConfigData);
		HP.deleteMarketoCookie(res, modelData);

		pageControllerUtil.postController(req, res, next, 'homepageV2/views/hbs/homepageV2_', modelData);
	}).fail((err) => {
		console.error(err);
		console.error(err.stack);
		next(err);
	});
};

