/**
 * @module ignore asserts
 * @description By pass all middleware asserts
 * @author aganeshalingam@ebay.com
 */

'use strict';

var utils = require(process.cwd() + "/modules/utils");

module.exports = function() {
    return function(req, res, next) {
        if (utils.isReqTypeAsserts(req)) {
            var err = new Error();
            err.status = 0; // ignore
            next(err);
        }
        next();
    }
}