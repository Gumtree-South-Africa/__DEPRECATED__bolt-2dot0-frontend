'use strict';

var i18n = null, homePageApp = null, express = require('express'),
    _ = require('underscore'),
    router = express.Router(),
    HomepageModel= require('../../builders/HomePage/model_builder/HomePageModel'),
    kafkaService = require(process.cwd() + '/server/utils/kafka');

var util = require('util');
var i18n = require('i18n');

module.exports = function (app) {
    homePageApp = app;
  //i18n = app.locals.i18n;
  app.use('/', router);
};

router.get('/', function (req, res, next) {
    var model = HomepageModel(req, res);
    //i18n = homePageApp.locals.i18n; console.log("homepage controller i18n xxxxxxxxxxxxxxxxxxxxxxxxxx"  + util.inspect(i18n, {showHidden: false, depth: 1}));
    //i18n.setLocale(res, res.config.locale); console.log(i18n.getLocale(res));

    var extraData =
    {
        env: 'public',
        locale: res.config.locale,
        country: res.config.country,
        site: res.config.name,
        pagename: 'HomePage'
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
      extraData.level2Location = result[7]; //console.log('home-----------' + res.config.locale);
        extraData.helpers = {
            i18n: function (msg) {

                i18n.configure({

                    objectNotation: true,
                    directory: process.cwd() + '/app/locales/aui/',
                    prefix: 'translation-'
                });



                return i18n.__({phrase: msg, locale: res.config.locale});
            }
        };

      var  pageData = _.extend(result, extraData);
      
      //console.dir(extraData);

      res.render('homepage/views/hbs/homepage_' + res.config.locale, extraData);
      
      var log = res.config.country + ' homepage visited with requestId = ' + req.requestId;
      kafkaService.logInfo(res.config.locale, log);
  });
});
