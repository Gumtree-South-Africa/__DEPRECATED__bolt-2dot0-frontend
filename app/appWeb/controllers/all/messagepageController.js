'use strict';

let express = require('express'), router = express.Router();
//Article = require('../../builders/model_builder/article');


router.get('/', function(req, res, next) {
	//let articles = [new Article(), new Article()];
	res.render('index', {
		title: 'Message Page'
	});
});


module.exports = router;
