'use strict';

var express = require('express'), router = express.Router();
//Article = require('../../builders/model_builder/article');

module.exports = function(app) {
	app.use('/', router);
};

router.get('/message', function(req, res, next) {
	//var articles = [new Article(), new Article()];
	res.render('index', {
		title: 'Message Page'
	});
});
