'use strict';

module.exports = function(name, value) {
    return function(req, res, next) {
        // set header
        res.setHeader(name, value);

        // call next middleware
        next();
    };
};
