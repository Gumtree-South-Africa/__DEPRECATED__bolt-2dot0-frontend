var express = require('express'),
  router = express.Router(),
  Article = require('../../builders/model_builder/article');

module.exports = function (app) {
  app.use('/', router);
};

router.get('/', function (req, res, next) {
  console.log("in controller");
  console.dir(res.config);
  var articles = [new Article(), new Article()];
    res.render('homepage/views/hbs/homepage_' + res.config.locale, {
      	title: 'Generator-Express MVC',
      	articles: articles,
		env: 'public',
		locale: res.config.locale,
		site: 'Gumtree',
		pagename: 'homepage'
    });
});
