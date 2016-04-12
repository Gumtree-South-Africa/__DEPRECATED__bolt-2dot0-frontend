'use strict';

var _ = require('underscore');
var pageurlJson = require(process.cwd() + '/app/config/pageurl.json');

module.exports = function() {
    return function(req, res, next) {
        var nonSecurePaths = ['/', '/api'];

        if ( _.contains(nonSecurePaths, req.path) ) return next();

        // Check if User has logged in already, else redirect to login page
        var authCookieName = 'bt_auth';
        var authenticationCookie = req.cookies[authCookieName];
        if (typeof authenticationCookie === 'undefined') {
            // Redirect to login page
            var loginLink = pageurlJson.header.signInURL;
            res.redirect(loginLink);
        } else {
            next();
        }
    };
};