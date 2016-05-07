'use strict';

var _ = require('underscore');
var pageurlJson = require(process.cwd() + '/app/config/pageurl.json');

module.exports = function() {
    return function(req, res, next) {
        var mobileOnlyPaths = ['/quickpost'];

        if (_.contains(mobileOnlyPaths, req.path)) {
            var deviceInfo = req.app.locals.deviceInfo;
            if (!deviceInfo.isMobile) {
                var homepageLink = pageurlJson.header.defaultHomePageUrl;
                res.redirect(homepageLink);
            }
        }

        next();
    };
};