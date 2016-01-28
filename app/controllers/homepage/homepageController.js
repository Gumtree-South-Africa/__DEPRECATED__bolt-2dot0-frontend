'use strict';

var express = require('express'),
    _ = require('underscore'),
    router = express.Router(),
    HomepageModel= require('../../builders/HomePage/model_builder/HomePageModel');

module.exports = function (app) {
  app.use('/', router);
};

router.get('/', function (req, res, next) {
    var model = HomepageModel(req, res);

    var extraData =
    {
        env: 'public',
        locale: res.config.locale,
        country: res.config.country,
        site: res.config.name,
        pagename: 'homepage'
    };

    model.then(function (result) {
      extraData.header = result[0];
      extraData.location = result[1];
      extraData.category = result[2];
      extraData.trendingKeywords = result[3][0].keywords;
      extraData.topKeywords = result[3][1].keywords;
      extraData.initialGalleryInfo = result[4];
      extraData.totalLiveAdCount = result[5].totalLiveAds;
      extraData.level1Location = result[6];
      extraData.level2Location = result[7];

      var  pageData = _.extend(result, extraData);

      res.render('homepage/views/hbs/homepage_' + res.config.locale, extraData);
  });
});
