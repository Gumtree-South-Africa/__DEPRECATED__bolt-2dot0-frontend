'use strict';

var express = require('express'), router = express.Router();
//Article = require('../../builders/model_builder/article');


router.get('/', function(req, res, next) {
	//var articles = [new Article(), new Article()];
	res.render('index', {
		title: 'Message Page'
	});
});


module.exports = router;
