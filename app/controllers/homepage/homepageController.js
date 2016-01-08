'use strict';

var express = require('express'),
    _ = require('underscore'),
    router = express.Router(),
    HomepageModel= require('../../builders/HomePage/model_builder/HomePageModel');

module.exports = function (app) {
  app.use('/', router);
};

router.get('/', function (req, res, next) {
    console.log('res: ',res.config);
    var model = HomepageModel();
    
    var extraData = 
    {
        env: 'public',
        locale: res.config.locale,
        country: res.config.country,
        site: res.config.name,
        pagename: 'homepage'
    };

    model.then(function (result) {
      
      extraData.location = result[0];
      extraData.category = result[1];
      
      var  pageData = _.extend(result, extraData);
      
      res.render('homepage/views/hbs/homepage_' + res.config.locale, extraData);
  });
});
