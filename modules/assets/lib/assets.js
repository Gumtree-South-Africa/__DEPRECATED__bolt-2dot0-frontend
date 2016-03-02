/**
 * @module Assets
 * @description An assets libary that will extract js and css urls from.
 * @author aganeshalingam@ebay.com
 */


"use strict";

var cjson = require('cjson');
var json = cjson.load(process.cwd() + "/app/config/assets/jsmin.json");

module.exports = function(app, locale) {
    return function(req, res, next) {
            res.locals.jsAssets = getAssets(locale);
            next();

    }
};

function getAssets(locale) {

    var jsArry = [];
   // var locales = "en_ZA";


    json.forEach(function(site) {
        var localeOk = isLocalePresent(site.locales, locale);

        if (localeOk ) {
            site.src.forEach(function(jsUrl){
                jsArry.push(jsUrl);
            });
        }
    });
    return jsArry;
};

function isLocalePresent(locales, locale) {
    //console.log(locales)
    if (Array.isArray(locales) ) {
        for(var i=0; i<locales.length; i++) {
            if (locales[i] == locale) {
                return true;
            }
        }
    }

    return false;
}


