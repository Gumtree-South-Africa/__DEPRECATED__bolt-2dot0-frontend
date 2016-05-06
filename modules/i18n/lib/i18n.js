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
module.exports.initMW = function(app, locale, i18nOrg) {
   // console.log("-------------bolt-i18n " + process.cwd() + '/app/locales/json/' + app.config.locale);
    return function(req, res, next) {

        initConfigI18n(locale, i18nOrg);

        //app.locals.i18n = instance(i18nOrg);
        res.locals.i18n = instance(i18nOrg);

        next();
    };
};

module.exports.init = function(locale) {
    // console.log("locale ======= ", locale);
    initConfigI18n(locale, i18nOrg);
};

module.exports.msg = function(msg) {
    return i18n.__(msg);
   // console.log("msg ======" + msg);
};

function initConfigI18n(locale, i18nOrg) {
    i18nOrg.configure({
        updateFiles: false,
        objectNotation: true,
        directory: process.cwd() + '/app/locales/json/' + locale,
        prefix: 'translation_',
        register: global,
        queryParameter: 'lang',
        defaultLocale: locale
    });
}
