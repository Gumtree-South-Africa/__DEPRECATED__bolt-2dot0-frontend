//jshint ignore: start
'use strict';

// 
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
	console.time('Instrument-Homepage-Controller');
	
	// Set pagetype in request
	req.app.locals.pagetype = pagetypeJson.pagetype.HOMEPAGE;
	
	// Build Model Data
	var modelData =
    {
        env: 'public',
        locale: res.locals.config.locale,
        country: res.locals.config.country,
        site: res.locals.config.name,
        pagename: pagetypeJson.pagetype.HOMEPAGE
    };

	// Retrieve Data from Model Builders
	var bapiConfigData = res.locals.config.bapiConfigData;
	var model = HomepageModel(req, res);
    model.then(function (result) {
      // Data from BAPI
      /*
      modelData.header = result[0].header;
      modelData.footer = result[0].footer;
      modelData.dataLayer = result[0].dataLayer;

      modelData.level2Location = result[1];

      modelData.trendingKeywords = result[2][0].keywords;
      modelData.topKeywords = result[2][1].keywords;

      modelData.initialGalleryInfo = result[3];

      modelData.totalLiveAdCount = result[4].totalLiveAds; 

      modelData.seo = result[5];
      */


      modelData.header = result["common"].header || {};
      modelData.footer = result["common"].footer || {};
      modelData.dataLayer = result["common"].dataLayer || {};

	  modelData.level2Location = result["level2Loc"] || {};

	  if (result["keyword"]) {
	  	modelData.trendingKeywords = result["keyword"][0].keywords || {};
		modelData.topKeywords = result["keyword"][1].keywords || {};
	  }

      modelData.initialGalleryInfo = result["gallery"] || {};

	  if (result["adstatistics"]) {
		modelData.totalLiveAdCount = result["adstatistics"].totalLiveAds || {}; 
	  }
      modelData.seo = result["seo"] || {};


      // Cached Data from BAPI
      modelData.location = res.locals.config.locationData;
      modelData.category = res.locals.config.categoryData;

	  //  Device data for handlebars
	  modelData.device = req.app.locals.deviceInfo;
      
	  // Special Data needed for HomePage in header, footer, content
      HP.extendHeaderData(req, modelData);
      HP.extendFooterData(modelData);
      HP.buildContentData(modelData, bapiConfigData);
      
      //console.dir(modelData);
      
      // Render
      res.render('homepage/views/hbs/homepage_' + res.locals.config.locale, modelData, function(err, html) {
		  if (err) {
			  err.status = 500;

			  return next(err);
		  } else {
			  res.send(html);
		  }
	  });

      // Kafka Logging
      var log = res.locals.config.country + ' homepage visited with requestId = ' + req.requestId;
      kafkaService.logInfo(res.locals.config.locale, log);
      
      // Graphite Metrics
      
      console.timeEnd('Instrument-Homepage-Controller');
    });
});


var HP = {
	/**
	 * Special header data for HomePage
	 */
	extendHeaderData : function(req, modelData) {
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
	    
	    // Location Id Cookie
	    
	    // Marketo 
	    modelData.header.marketo.brandCode = ""; // TODO check with FE about usage of this variable in hbs
	    // console.log('$$$$$$$$$$$$$$$$$$$$$$$$$', modelData.header.marketo);
	    
	    // Header Page Messages
	    HP.buildHeaderPageMessages(req, modelData);
	},
	
	/**
	 * Build Page-Messages data for HomePage
	 */
	buildHeaderPageMessages : function(req, modelData) {
		modelData.header.pageMessages = {};
		switch(req.query.status){
			case "userregistered" :
				modelData.header.pageMessages.success ="home.user.registered";
				modelData.header.pageType = pagetypeJson.pagetype.USER_REGISTRATION_SUCCESS;
				break;
			case "adinactive":
				modelData.header.pageMessages.success = "home.ad.notyetactive";
				break;
			case "resetpassword":
				modelData.header.pageMessages.success = "home.reset.password.success";
				modelData.header.pageType = pagetypeJson.pagetype.PASSWORD_RESET_SUCCESS;
				break;
			default:
				modelData.header.pageMessages.success = "";
				modelData.header.pageMessages.error = "";
				modelData.header.pageType = "";
		}
		switch (req.query.resumeabandonedordererror){
			case "adnotactive":
				modelData.header.pageMessages.error = "abandonedorder.adNotActive";
				break;
			case "adfeaturepaid":
				modelData.header.pageMessages.error = "abandonedorder.adFeaturePaid.multiple_ads";
				break;
		}
	},

	/**
	 * Special footer data for HomePage
	 */
	extendFooterData : function(modelData) {
		var baseJSComponentDir = "/views/components/";

		modelData.footer.pageJSUrl = modelData.footer.baseJSUrl + 'HomePage.js';
	    if (!modelData.footer.min) {
		      modelData.footer.javascripts.push(baseJSComponentDir + 'categoryList/js/app.js');
		      if (! modelData.header.enableLighterVersionForMobile) {
		    	  modelData.footer.javascripts.push(baseJSComponentDir + 'countryMap/js/Map.js');
		    	  modelData.footer.javascripts.push(baseJSComponentDir + 'adCarousel/js/CarouselExt/modernizr.js');
		    	  modelData.footer.javascripts.push(baseJSComponentDir + 'adCarousel/js/CarouselExt/owl.carousel.js');
		    	  modelData.footer.javascripts.push(baseJSComponentDir + 'adCarousel/js/CarouselExt/carouselExt.js');
		      }
		      var availableAdFeatures = modelData.footer.availableAdFeatures;
		      if (typeof availableAdFeatures !== 'undefined') {
			      for (var i=0; i<availableAdFeatures.length; i++) {
			    	  if (availableAdFeatures[i] === 'HOME_PAGE_GALLERY') {
			    		 modelData.footer.javascripts.push(baseJSComponentDir + 'adCarousel/js/adCarousel.js');
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
