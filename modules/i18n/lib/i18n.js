/**
 * @module i18n
 * @description i18n
 * @author aganeshalingam@ebay.com
 */


'use strict';


// init middleware
var i18nMiddleware = function() {
    this.locale = 'bt_BT';
    return this;
};

i18nMiddleware.prototype.initMW = function(app) {
    var scope = this;

    return function(req, res, next) {
        var i18n = require('i18n'),
            util = require('util');

        i18n.configure({
            updateFiles: false,
            objectNotation: true,
            directory: process.cwd() + '/app/locales/json/' + scope.locale,
            prefix: 'translation_',
            defaultLocale: scope.locale
        });

        app.locals.i18n = i18n;
        res.locals.i18n = i18n;

        next();
    };
};

module.exports = i18nMiddleware;

