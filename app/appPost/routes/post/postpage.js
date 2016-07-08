'use strict';

var express = require('express'), router = express.Router();

router.get('/', function(req, res, next) {
	console.log('helloooooooooooooooo');
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
	res.json(modelData);
});


module.exports = router;
