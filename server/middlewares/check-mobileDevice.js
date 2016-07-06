'use strict';

var _ = require('underscore');
var pageurlJson = require(process.cwd() + '/app/config/pageurl.json');

module.exports = function() {
	return function(req, res, next) {
		// allowing quickpost to work for desktop, we need links to post ad flow to work regardless of desktop
		// var mobileOnlyPaths = ['/quickpost'];
        //
		// if (_.contains(mobileOnlyPaths, req.path)) {
		// 	var deviceInfo = req.app.locals.deviceInfo;
		// 	if (!deviceInfo.isMobile) {
		// 		var homepageLink = pageurlJson.header.defaultHomePageUrl;
		// 		res.redirect(homepageLink);
        //
		// 		return;
		// 	}
		// }

		next();
	};
};
