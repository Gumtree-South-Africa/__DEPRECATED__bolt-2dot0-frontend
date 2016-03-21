/**
 * @module error middleware
 * @description Handlebar template inhertiance and helpers
 * @author aganeshalingam@ebay.com
 */

"use strict";

var urlPattern = require("url-pattern");
var util = require('util'),
    str = require('string'),
    displayError = require('./displayError'),
    stringUtl = require('string');


module.exports = function(app) {
    return function(err, req, res, next) {

        if (err.status == 0) {
            // next();
            res.send("");
        }

        // if 404 request then to error page
        if (err.status == 404 || err.status == 410) {
            res.locals.err = err;

            // set the http status code
            res.statusCode = 404;
            if (isAjaxReq(req)) {
                console.error(err);
                res.status(404).json({status:404, message: 'page not found', type:'external'});
            } else {
                displayError.message(req, res, next);
            }

        }
        // if 500 request then to error page
        else if (err.status == 500) {

            // hack: increace the stack trace for NodeJS
            Error.stackTraceLimit = 100;

            console.log("\n\n =====  Error Message ==== \n");
            console.log(err.message + "\n\n");
            console.trace("======= error stack trace =========");
            res.locals.err = err;
            res.statusCode = 500;
            //console.error(err.stackTrace);
            if ( isAjaxReq(req)) {
                console.error(err);
                res.status(500).json({status:500, message: 'server error', type:'internal'});
            } else {
                displayError.message(req, res, next);
            }

        }

    };
};


// 404 middleware
module.exports.four_o_four = function(app) {

    return function(req, res, next) {
        // avoid going to error page for resource pages
        if (isResourceReq(req)) {
            var err = new Error('Not Found');
            err.status = 200;
           return next();
        } else {
            var err = new Error('Not Found');
            err.status = 404;
           return next(err);
        }

    }
};

function isAjaxReq(req) {

    if (req.xhr || stringUtl(req.path).contains("api")) {
        return true;
    }


    return false;
}

// check if it is app resource request
function isResourceReq(req) {

    // set url pattern object
    var urlPttrn = new urlPattern(/\.(gif|jpg|jpeg|tiff|png|js|css|txt)$/i, ['ext']);
    // match the url pattern
    var matchedImageExt = urlPttrn.match(req.originalUrl);

   // console.log("req.originalUrl ====== " + req.originalUrl);
    //if (matchedImageExt)
    //console.log("matchedImageExt ====== " + matchedImageExt.ext);

    if (matchedImageExt)
        return true;
    return false;
}




