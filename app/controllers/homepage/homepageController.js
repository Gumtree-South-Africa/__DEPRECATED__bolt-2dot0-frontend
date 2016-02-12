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

    var extraData =
    {
        env: 'public',
        locale: res.config.locale,
        country: res.config.country,
        site: res.config.name,
        pagename: pagetypeJson.pagetype.HOMEPAGE
    };

    model.then(function (result) {
      extraData.header = result[0][0];
      extraData.footer = result[0][1];
      extraData.location = result[1];
      extraData.category = result[2];
      extraData.trendingKeywords = result[3][0].keywords;
      extraData.topKeywords = result[3][1].keywords;
      extraData.initialGalleryInfo = result[4];
      extraData.totalLiveAdCount = result[5].totalLiveAds;
      extraData.level1Location = result[6];
      extraData.level2Location = result[7];
      
      HP.extendHeaderData(extraData);
      HP.extendFooterData(extraData);
      HP.buildContentData(extraData, bapiConfigData.content.homepage);


      // Special data for homepage controller
      extraData.header.pageTitle = '';
      extraData.header.metaDescription = '';
      extraData.header.metaRobots = '';
      extraData.header.canonical = extraData.header.homePageUrl;
      extraData.header.pageUrl = extraData.header.homePageUrl;
      extraData.header.pageType = pagetypeJson.pagetype.HOMEPAGE;

        extraData.helpers = {
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


        var  pageData = _.extend(result, extraData);

     // console.dir(extraData);

      res.render('homepage/views/hbs/homepage_' + res.config.locale, extraData);

      var log = res.config.country + ' homepage visited with requestId = ' + req.requestId;
      kafkaService.logInfo(res.config.locale, log);
  });
});


var HP = {
	/**
	 * Special header data for HomePage
	 */
	extendHeaderData : function(extraData) {
		// SEO
	    extraData.header.pageType = pagetypeJson.pagetype.HOMEPAGE;
	    extraData.header.pageTitle = '';
	    extraData.header.metaDescription = '';
	    extraData.header.metaRobots = '';
	    extraData.header.canonical = extraData.header.homePageUrl;
	    extraData.header.pageUrl = extraData.header.homePageUrl;

	    // CSS
	    extraData.header.pageCSSUrl = extraData.header.baseCSSUrl + 'HomePage.css';
	    if (extraData.header.min) {
			  // TODO add device detection and add /all CSS
	  	  extraData.header.continerCSS.push(extraData.header.baseCSSUrl + 'mobile/' + extraData.header.brandName + '/' + extraData.country + '/' + extraData.locale + '/HomePage.min.css');
		  } else {
			  extraData.header.continerCSS.push(extraData.header.baseCSSUrl + 'mobile/' + extraData.header.brandName + '/' + extraData.country + '/' + extraData.locale + '/HomePage.css');
		  }
	},

	/**
	 * Special footer data for HomePage
	 */
	extendFooterData : function(extraData) {
		extraData.footer.pageJSUrl = extraData.footer.baseJSUrl + 'HomePage.js';
	    if (!extraData.footer.min) {
		      extraData.footer.javascripts.push(extraData.footer.baseJSUrl + 'common/CategoryList.js');
		      if (! extraData.header.enableLighterVersionForMobile) {
		    	  extraData.footer.javascripts.push(extraData.footer.baseJSUrl + 'HomePage/Map.js');
		    	  extraData.footer.javascripts.push(extraData.footer.baseJSUrl + 'HomePage/CarouselExt/modernizr.js');
		    	  extraData.footer.javascripts.push(extraData.footer.baseJSUrl + 'HomePage/CarouselExt/owl.carousel.js');
		    	  extraData.footer.javascripts.push(extraData.footer.baseJSUrl + 'HomePage/CarouselExt/carouselExt.js');
		      }
		      var availableAdFeatures = extraData.footer.availableAdFeatures;
		      for (var i=0; i<availableAdFeatures.length; i++) {
		    	  if (availableAdFeatures[i] === 'HOME_PAGE_GALLERY') {
		    		  extraData.footer.javascripts.push(extraData.footer.baseJSUrl + 'widgets/carousel.js');
		    	  }
		      }
	    } else {
	  	  if (extraData.header.enableLighterVersionForMobile) {
	  		  extraData.footer.javascripts.push(extraData.footer.baseJSUrl + 'HomePage_' + extraData.locale + '_light.min.js');
	  	  } else {
	  		  extraData.footer.javascripts.push(extraData.footer.baseJSUrl + 'HomePage_' + extraData.locale + '.min.js');
	  	  }
	    }
	},

	/**
	 * Build content data for HomePage
	 */
	buildContentData : function(extraData, homepageConfigData) {
		extraData.content = {};
		extraData.content.topHomePageAdBanner = homepageConfigData.topHomePageAdBanner;

		if (homepageConfigData.homepageBanners !== null) {
			var homePageBannerUrls = [];
			var homepageBanners = homepageConfigData.homepageBanners;
			for (var i=0; i<homepageBanners.length; i++) {
				homePageBannerUrls[i] = extraData.footer.baseImageUrl + homepageBanners[i];
		    }
			extraData.content.homePageBannerUrl = homePageBannerUrls[Math.floor(Math.random() * homePageBannerUrls.length)];
		}
	}
};
