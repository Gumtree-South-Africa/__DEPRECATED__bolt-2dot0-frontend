var express = require('express'),
    _ = require("underscore"),
    router = express.Router(),
    HomepageModel= require("../../builders/HomePage/model_builder/HomePageModel");

module.exports = function (app) {
  app.use('/', router);
};

router.get('/', function (req, res, next) {
    var model = HomepageModel();
    var extraData = 
    {
        env: 'public',
        locale: res.config.locale,
        site: 'Gumtree',
        pagename: 'homepage'
    };

    model.then(function (result) {
      var  pageData = _.extend(result, extraData);
      res.render('homepage/views/hbs/homepage_' + res.config.locale, pageData);
  });
});
