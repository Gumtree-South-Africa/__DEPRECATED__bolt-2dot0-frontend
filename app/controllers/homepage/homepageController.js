'use strict';

var express = require('express'),
    _ = require('underscore'),
    router = express.Router(),
    HomepageModel= require('../../builders/HomePage/model_builder/HomePageModel');

module.exports = function (app) {
  app.use('/', router);
};

router.get('/', function (req, res, next) {
	var cookieName = 'bt_auth';
	var authcookie = req.cookies[cookieName];
    var model = HomepageModel(authcookie);
    
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
      
      console.dir(extraData);
      
      var  pageData = _.extend(result, extraData);
      
      res.render('homepage/views/hbs/homepage_' + res.config.locale, extraData);
  });
});
