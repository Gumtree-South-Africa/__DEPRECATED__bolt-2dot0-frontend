/**
 * @module error middleware
 * @description Handlebar template inhertiance and helpers
 * @author aganeshalingam@ebay.com
 */

"use strict";

var urlPattern = require("url-pattern");
var util = require('util'),
    str = require('string');


module.exports = function(app) {
    return function(err, req, res, next) {
        // any request related to the app then goto next middleware
        if(err.status != 404) {
            return next();
        }
        // if 404 request then to error page
        else if (err.status == 404 ) {
            //So when you add a custom error handler, you will want to delegate
            // to the default error handling mechanisms in Express,
            // when the headers have already been sent to the client
            if (res.headersSent) {
                return next(err);
            }
           // res.locals.err = 404;
            return res.redirect("/error/404");

            //return next();
        }
        // if 500 request then to error page
        else if (err.status == 500) {

            console.error(err.stack);

            if (res.headersSent) {
                return next(err);
            }

            res.redirect("/error/500");
        }
        res.redirect("/error");
    };
};


// 404 middleware
module.exports.four_o_four = function(app) {

    return function(req, res, next) {
        // avoid going to error page for resource pages
        if (isResourceReq(req)) {
            var err = new Error('Not Found');
            err.status = 200;
            next(err);
        } else {
            var err = new Error('Not Found');
            err.status = 404;
            next(err);
        }

    }
};


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

function isErrorPage(req) {
    var url = req.originalUrl;
   // console.log("url is error ? ====== " + str(req.originalUrl.toUpperCase()).contains("ERROR"));
    if (str(url.toUpperCase()).contains("ERROR"))
        return true;
    return false;
}


