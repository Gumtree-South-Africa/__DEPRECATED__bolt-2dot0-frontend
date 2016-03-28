'use strict';

module.exports = function(name, value) {
    return function(req, res, next) {
        console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$');
        // set header
        res.setHeader(name, value);

        // call next middleware
        next();
    };
};
