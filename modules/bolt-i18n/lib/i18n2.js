/**
 * @module i18n
 * @description localization
 * @author ngarga@ebay.com
 */

'use strict';
var i18node = require('i18n-2');

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
	    // Don't need dev mode because we aren't adding i18n strings during runtime
	    // If it's true and touches an i18n file it restarts nodemon
	    devMode: false,

        directory: process.cwd() + '/app/locales/bolt-translation',
        // change the cookie name from 'lang' to 'locale'
        cookieName: 'locale'
    });
}
