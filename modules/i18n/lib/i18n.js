/**
 * @module i18n
 * @description i18n
 * @author aganeshalingam@ebay.com
 */

'use strict';
var instance = require('instance');
var i18n = instance(require('i18n'));

var util = require('util');
var siteConfig = require(process.cwd() + '/server/config/sites.json');

//Default Locale
var locale = '';

// init middleware
module.exports.initMW = function(app) {
   // console.log("-------------bolt-i18n " + process.cwd() + '/app/locales/json/' + app.config.locale);
    return function(req, res, next) {

        for(var key in siteConfig.sites){
          if(req.headers.host.indexOf(key) >= 0){
            locale = siteConfig.sites[key].locale;
            break;
          }
        }

        initConfigI18n(locale);

        app.locals.i18n = i18n;
        res.locals.i18n = i18n;

        next();
    };
};

module.exports.init = function(locale) {
   // console.log("locale ======= ", locale);
    initConfigI18n(locale);
};

module.exports.msg = function(msg) {
    return i18n.__(msg);
   // console.log("msg ======" + msg);
};

function initConfigI18n(locale) {
    i18n.configure({
        updateFiles: false,
        objectNotation: true,
        directory: process.cwd() + '/app/locales/json/' + locale,
        prefix: 'translation_',
        defaultLocale: locale
    });
}
