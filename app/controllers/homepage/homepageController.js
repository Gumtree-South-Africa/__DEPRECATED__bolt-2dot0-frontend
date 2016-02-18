//jshint ignore: start
'use strict';

var express = require('express'),
    _ = require('underscore'),
    router = express.Router(),
    HomepageModel= require('../../builders/HomePage/model_builder/HomePageModel'),
    kafkaService = require(process.cwd() + '/server/utils/kafka'),
    deviceDetection = require(process.cwd() + '/modules/device-detection'),
    util = require('util'),
    i18n = require('i18n');

var pagetypeJson = require(process.cwd() + '/app/config/pagetype.json');
var pageurlJson = require(process.cwd() + '/app/config/pageurl.json');


module.exports = function (app) {
  app.use('/', router);
};


/**
 * Build HomePage Model Data and Render
 */
router.get('/', function (req, res, next) {
	// Data from the Middleware
	var modelData =
    {
        env: 'public',
        locale: res.config.locale,
        country: res.config.country,
        site: res.config.name,
        pagename: pagetypeJson.pagetype.HOMEPAGE
    };

	// Retrieve Data from Model Builders
	var bapiConfigData = res.config.bapiConfigData;
	
	var model = HomepageModel(req, res);
    model.then(function (result) {
      // Data from BAPI
      modelData.header = result[0][0];
      modelData.footer = result[0][1];
      modelData.location = result[1];
      modelData.category = result[2];
      modelData.trendingKeywords = result[3][0].keywords;
      modelData.topKeywords = result[3][1].keywords;
      modelData.initialGalleryInfo = result[4];
      modelData.totalLiveAdCount = result[5].totalLiveAds;
      modelData.level1Location = result[6];
      modelData.level2Location = result[7];
      modelData.seo = result[8];

	  //  Device data for handlebars
	  modelData.device = req.app.locals.deviceInfo;
      
	  // Special Data needed for HomePage in header, footer, content
      HP.extendHeaderData(modelData);
      HP.extendFooterData(modelData);
      HP.buildContentData(modelData, bapiConfigData);
      
      console.dir(modelData);
      
      // Render
      res.render('homepage/views/hbs/homepage_' + res.config.locale, modelData);

      // Kafka Logging
      var log = res.config.country + ' homepage visited with requestId = ' + req.requestId;
      kafkaService.logInfo(res.config.locale, log);
      
      // Graphite Metrics
    });
});


var HP = {
	/**
	 * Special header data for HomePage
	 */
	extendHeaderData : function(modelData) {
		// SEO
	    modelData.header.pageType = pagetypeJson.pagetype.HOMEPAGE;
	    modelData.header.pageTitle = modelData.seo.pageTitle;
	    modelData.header.metaDescription = modelData.seo.description; //TODO check if descriptionCat needed based on locale, and put that value
	    modelData.header.metaRobots = modelData.seo.robots;
	    modelData.header.canonical = modelData.header.homePageUrl;
	    modelData.header.pageUrl = modelData.header.homePageUrl;
	    if (modelData.header.seoDeepLinkingBaseUrlAndroid) {
	    	modelData.header.seoDeeplinkingUrlAndroid = modelData.header.seoDeepLinkingBaseUrlAndroid + "home";
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
	},

	/**
	 * Special footer data for HomePage
	 */
	extendFooterData : function(modelData) {
		
		modelData.footer.pageJSUrl = modelData.footer.baseJSUrl + 'HomePage.js';
	    if (!modelData.footer.min) {
		      modelData.footer.javascripts.push(modelData.footer.baseJSUrl + 'common/CategoryList.js');
		      if (! modelData.header.enableLighterVersionForMobile) {
		    	  modelData.footer.javascripts.push(modelData.footer.baseJSUrl + 'HomePage/Map.js');
		    	  modelData.footer.javascripts.push(modelData.footer.baseJSUrl + 'HomePage/CarouselExt/modernizr.js');
		    	  modelData.footer.javascripts.push(modelData.footer.baseJSUrl + 'HomePage/CarouselExt/owl.carousel.js');
		    	  modelData.footer.javascripts.push(modelData.footer.baseJSUrl + 'HomePage/CarouselExt/carouselExt.js');
		      }
		      var availableAdFeatures = modelData.footer.availableAdFeatures;
		      if (typeof availableAdFeatures !== 'undefined') {
			      for (var i=0; i<availableAdFeatures.length; i++) {
			    	  if (availableAdFeatures[i] === 'HOME_PAGE_GALLERY') {
			    		  modelData.footer.javascripts.push(modelData.footer.baseJSUrl + 'widgets/carousel.js');
			    	  }
			      }
		      }
	    } else {
	  	  if (modelData.header.enableLighterVersionForMobile) {
	  		  modelData.footer.javascripts.push(modelData.footer.baseJSUrl + 'HomePage_' + modelData.locale + '_light.min.js');
	  	  } else {
	  		  modelData.footer.javascripts.push(modelData.footer.baseJSUrl + 'HomePage_' + modelData.locale + '.min.js');
	  	  }
	    }
	},

	/**
	 * Build content data for HomePage
	 */
	buildContentData : function(modelData, bapiConfigData) {
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
				for (var i=0; i<homepageBanners.length; i++) {
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
		
		// Search Bar
		modelData.content.disableSearchbar = false;
		
		// Page Sub Title
		modelData.content.pageSubTitle = null;
	}
};
