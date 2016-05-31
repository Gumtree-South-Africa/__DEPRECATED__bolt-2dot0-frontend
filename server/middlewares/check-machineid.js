'use strict';

var _ = require('underscore');
var cuid = require('cuid');


module.exports = function() {
    return function(req, res, next) {
        // Get from cookie. If cookie not there, create one.
        var machguidCookieName = 'machguid';
        var machguidCookie = req.cookies[machguidCookieName];
        if (typeof machguidCookie==='undefined' || (typeof machguidCookie !== 'undefined' && _.isEmpty(machguidCookie))) {
            // TODO: check with 1.0 code on how they decrypt machguid
            var now = new Date();
            machguidCookie = cuid() + '-' + now.getTime().toString(16);

            // Set back in cookie
            res.clearCookie(machguidCookieName);
            res.cookie(machguidCookieName, machguidCookie, {maxAge: 1000*60*60*24*365, httpOnly: true});
        }

        // Set in request context
        req.app.locals.machineid = machguidCookie;

        // call next middleware
        next();
    };
};