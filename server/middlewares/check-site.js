'use strict';


module.exports = function(app) {
    return function(req, res, next) {
        // send site information along
        res.config = {};
        res.config.name = app.config.name;
        res.config.locale = app.config.locale;
        res.config.country = app.config.country;
        res.config.hostname = app.config.hostname;
        res.config.bapiConfigData = app.config.bapiConfigData;
        // call next middleware
        next();
    };
};
