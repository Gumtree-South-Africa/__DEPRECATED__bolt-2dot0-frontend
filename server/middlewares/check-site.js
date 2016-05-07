'use strict';

var instance = require('instance');

module.exports = function(app) {
    return function(req, res, next) {
        // send site information along
        res.locals.config = {};
        res.locals.config.name = app.locals.config.name;
        res.locals.config.locale = app.locals.config.locale;
        res.locals.config.country = app.locals.config.country;
        res.locals.config.hostname = app.locals.config.hostname;
        res.locals.config.baseDomainSuffix = typeof process.env.BASEDOMAINSUFFIX!=='undefined' ? '.' + process.env.BASEDOMAINSUFFIX : '';
        res.locals.config.domainName = '.' + res.locals.config.hostname + res.locals.config.baseDomainSuffix ;
        res.locals.config.basePort = app.locals.config.basePort;

        res.locals.config.bapiConfigData = app.locals.config.bapiConfigData;
        
        res.locals.config.locationData = app.locals.config.locationData;
        res.locals.config.locationIdNameMap = app.locals.config.locationIdNameMap;
        res.locals.config.locationdropdown = app.locals.config.locationdropdown;
        
        res.locals.config.categoryData = app.locals.config.categoryData;
        res.locals.config.categorydropdown = app.locals.config.categorydropdown;

        res.locals.i18n = instance(app.locals.i18n);
        res.locals.i18n.configure({
            updateFiles: false,
            objectNotation: true,
            directory: process.cwd() + '/app/locales/json/' + res.locals.config.locale,
            prefix: 'translation_',
            defaultLocale: res.locals.config.locale
        });

        // call next middleware
        next();
    };
};
