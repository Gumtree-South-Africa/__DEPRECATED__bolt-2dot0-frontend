var express = require('express'),
  router = express.Router(),
  Article = require('../../builders/model_builder/article');

module.exports = function (app) {
  app.use('/', router);
};

router.get('/', function (req, res, next) {
  var articles = [new Article(), new Article()];
    res.render('homepage/views/hbs/homepage_es_MX', {
      	title: 'Generator-Express MVC',
      	articles: articles,
		env: 'public',
		locale: 'en_ZA',
		site: 'Gumtree',
		pagename: 'homepage'
    });
});
