/**
 * @module i18n
 * @description localization
 * @author ngarga@ebay.com
 */

'use strict';
var i18node = require('i18n-2');
var hbs = require('handlebars');

var i18n = require('i18n');

module.exports.init = function(app, locale) {
    // console.log("locale ======= ", locale);
    initConfigI18n(app, locale);
};

function initConfigI18n(app, locale) {
    i18node.expressBind(app, {
        // setup some locales - other locales default to en silently
        locales: [locale],
        // setup extension
        extension:'.json',

        directory: process.cwd() + '/app/locales/bolt-translation',
        // change the cookie name from 'lang' to 'locale'
        cookieName: 'locale'
    });
}
