/**
 * @module i18n
 * @description i18n
 * @author aganeshalingam@ebay.com
 */

'use strict';

var i18n = require('i18n');

var util = require('util');

// init middleware
module.exports.initMW = function(app, locale) {
   // console.log("-------------bolt-i18n " + process.cwd() + '/app/locales/json/' + app.config.locale);
    return function(req, res, next) {
        initConfigI18n(locale);

        app.locals.i18n = i18n;
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


