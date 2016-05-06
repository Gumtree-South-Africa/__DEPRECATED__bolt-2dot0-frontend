'use strict';

var _ = require('underscore');
var machineId = require( "machine-id" );

module.exports = function() {
    return function(req, res, next) {
        // Get from cookie. If cookie not there, create one.
        var machguidCookieName = 'machguid';
        var machguidCookie = req.cookies[machguidCookieName];
        if (typeof machguidCookie==='undefined' || (typeof machguidCookie !== 'undefined' && _.isEmpty(machguidCookie))) {
            machguidCookie = machineId();

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