'use strict';

var str = require('string'),
    urlPattern = require("url-pattern");

// check if it is app resource request
module.exports.isReqTypeAsserts = function(req) {

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