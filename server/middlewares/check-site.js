'use strict';


module.exports = function(app) {
    return function(req, res, next) {
        // send site information along
        res.locals.config = {};
        res.locals.config.name = app.locals.config.name;
        res.locals.config.locale = app.locals.config.locale;
        res.locals.config.country = app.locals.config.country;
        res.locals.config.hostname = app.locals.config.hostname;
        res.locals.config.bapiConfigData = app.locals.config.bapiConfigData;
        res.locals.config.locationData = app.locals.config.locationData;
        res.locals.config.categoryData = app.locals.config.categoryData;
        // call next middleware
        next();
    };
};
