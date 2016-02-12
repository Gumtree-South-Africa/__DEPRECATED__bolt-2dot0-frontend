'use strict';

var express = require('express'),
    _ = require('underscore'),
    router = express.Router(),
    HomepageModel= require('../../builders/HomePage/model_builder/HomePageModel'),
    kafkaService = require(process.cwd() + '/server/utils/kafka'),
    util = require('util'),
    i18n = require('i18n');

var pagetypeJson = require(process.cwd() + '/app/config/pagetype.json');
var pageurlJson = require(process.cwd() + '/app/config/pageurl.json');


module.exports = function (app) {
  app.use('/', router);
};

router.get('/', function (req, res, next) {
    var bapiConfigData = res.config.bapiConfigData;
    var model = HomepageModel(req, res);

    var modelData =
    {
        env: 'public',
        locale: res.config.locale,
        country: res.config.country,
        site: res.config.name,
        pagename: pagetypeJson.pagetype.HOMEPAGE
    };

    model.then(function (result) {
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
      
      HP.extendHeaderData(modelData);
      HP.extendFooterData(modelData);
      HP.buildContentData(modelData, bapiConfigData.content.homepage);

        modelData.helpers = {
            i18n: function (msg) {
                i18n.configure({
                    updateFiles: false,
                    objectNotation: true,
                    directory: process.cwd() + '/app/locales/json/' + res.config.locale + '/',
                    prefix: 'translation_'
                });
                return i18n.__({phrase: msg, locale: res.config.locale});
            }
        };
      
      console.dir(modelData);

      var  pageData = _.extend(result, modelData);
      res.render('homepage/views/hbs/homepage_' + res.config.locale, modelData);

      var log = res.config.country + ' homepage visited with requestId = ' + req.requestId;
      kafkaService.logInfo(res.config.locale, log);
  });
});


var HP = {
	/**
	 * Special header data for HomePage
	 */
	extendHeaderData : function(modelData) {
		// SEO
	    modelData.header.pageType = pagetypeJson.pagetype.HOMEPAGE;
	    modelData.header.pageTitle = '';
	    modelData.header.metaDescription = '';
	    modelData.header.metaRobots = '';
	    modelData.header.canonical = modelData.header.homePageUrl;
	    modelData.header.pageUrl = modelData.header.homePageUrl;

	    // CSS
	    modelData.header.pageCSSUrl = modelData.header.baseCSSUrl + 'HomePage.css';
	    if (modelData.header.min) {
			  // TODO add device detection and add /all CSS
	  	  modelData.header.continerCSS.push(modelData.header.baseCSSUrl + 'mobile/' + modelData.header.brandName + '/' + modelData.country + '/' + modelData.locale + '/HomePage.min.css');
		  } else {
			  modelData.header.continerCSS.push(modelData.header.baseCSSUrl + 'mobile/' + modelData.header.brandName + '/' + modelData.country + '/' + modelData.locale + '/HomePage.css');
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
		      for (var i=0; i<availableAdFeatures.length; i++) {
		    	  if (availableAdFeatures[i] === 'HOME_PAGE_GALLERY') {
		    		  modelData.footer.javascripts.push(modelData.footer.baseJSUrl + 'widgets/carousel.js');
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
	buildContentData : function(modelData, homepageConfigData) {
		modelData.content = {};
		
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
		
		// Gallery
		modelData.content.seeAllUrl = 's-all-the-ads/v1b0p1?fe=2';
		
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
	}
};
