'use strict';

var express = require('express'), cwd = process.cwd(), pageControllerUtil = require(cwd + '/app/controllers/page/PageControllerUtil'), router = express.Router();

module.exports = function(app) {
	app.use('/', router);
};

router.get('/postpage', function(req, res, next) {
	console.log('hello');
	// var modelData =
	// {
	//     locale: res.locals.config.locale,
	//     country: res.locals.config.country,
	//     site: res.locals.config.name,
	//     pagename: req.app.locals.pagetype,
	//     device: req.app.locals.deviceInfo,
	//     ip: req.app.locals.ip,
	//     machineid: req.app.locals.machineid,
	//     useragent: req.app.locals.useragent
	// };

	var modelData = {locssale: res.locals.config.locale};
	console.log('modelData: ', modelData);
	pageControllerUtil.postController(req, res, next, 'postpage/views/hbs/postpage_', modelData);

});
