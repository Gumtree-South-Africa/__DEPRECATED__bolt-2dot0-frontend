'use strict';

let cuid = require('cuid');

let cwd = process.cwd();
let pageControllerUtil = require(cwd + '/app/appWeb/controllers/all/PageControllerUtil');
let HomepageModel = require(cwd + '/app/builders/page/HomePageModelV2');
let marketoService = require(cwd + '/server/utils/marketo');
let Base64 = require(process.cwd() + '/app/utils/Base64');
let pagetypeJson = require(cwd + '/app/config/pagetype.json');
let EpsModel = require(cwd + '/app/builders/common/EpsModel');


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
		if (modelData.header.min) {
			modelData.header.containerCSS.push(modelData.header.localeCSSPath + '/HomePage.min.css');
		} else {
			modelData.header.containerCSS.push(modelData.header.localeCSSPath + '/HomePage.css');
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
			case 'userRegistered' :
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
			case 'adInactive':
				modelData.header.pageMessages.success = 'home.ad.notyetactive';
				break;
			case 'resetPassword':
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
		switch (req.query.resumeAbandonedOrderError) {
			case 'adNotActive':
				modelData.header.pageMessages.error = 'abandonedorder.adNotActive';
				break;
			case 'adFeaturePaid':
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
		modelData.footer.javascripts.push(modelData.footer.baseJSMinUrl + 'HomePageV2Legacy.min.js');
		if (!modelData.footer.min) {
			if (modelData.header.enableLighterVersionForMobile) {
				modelData.footer.javascripts.push(modelData.footer.baseJSMinUrl + `HomePage_mobile_${modelData.locale}.js`);
			} else {
				modelData.footer.javascripts.push(modelData.footer.baseJSMinUrl + `HomePage_desktop_${modelData.locale}.js`);
			}
		} else {
			if (modelData.header.enableLighterVersionForMobile) {
				modelData.footer.javascripts.push(modelData.footer.baseJSMinUrl + `HomePage_mobile_${modelData.locale}.js`);
			} else {
				modelData.footer.javascripts.push(modelData.footer.baseJSMinUrl + `HomePage_desktop_${modelData.locale}.js`);
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

			// Menu Section (the one below the navbar)
			if (homepageConfigData.sectionMenu !== null) {
				modelData.sectionMenu = homepageConfigData.sectionMenu;
			}
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
	// Retrieve Data from Model Builders
	req.app.locals.pagetype = pagetypeJson.pagetype.HOMEPAGEV2;

	let homepage = new HomepageModel(req, res);
	let modelPromise = homepage.populateData();

	modelPromise.then((modelData) => {
		HP.extendHeaderData(req, modelData);
		HP.extendFooterData(modelData);
		HP.buildContentData(modelData, res.locals.config.bapiConfigData);
		HP.deleteMarketoCookie(res, modelData);

		modelData.eps = EpsModel();

		pageControllerUtil.postController(req, res, next, 'homepageV2/views/hbs/homepageV2_', modelData);
	}).fail((err) => {
		console.error(err);
		console.error(err.stack);
		next(err);
	});
};

