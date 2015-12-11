'use strict';


module.exports = function(app) {
    return function(req, res, next) {
        // send site information along
        res.config = {};
        res.config.name = app.config.name;
        res.config.locale = app.config.locale;
        res.config.hostname = app.config.hostname;
        
        console.log("Innnnnnnnnnnnnnnnnnnnnnnnnnn");
        console.log(res.config.locale);
        
        // call next middleware
        next();
    };
};
