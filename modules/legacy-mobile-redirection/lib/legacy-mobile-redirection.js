/**
 * Created by aganeshalingam on 1/27/16.
 */

'use strict';

var str = require('string'),
    urlPattern = require("url-pattern"),
    util = require(process.cwd() + "/modules/utils"),
    ua;// userAgent

var blackList = [ "sgh-e250i", "series40", "series60",
    "opera mini", "opera mobi", "n905i", "blackberry9300/5", "BLACKBERRY9300", "BLACKBERRY 9300", "lumia 520"];

var liteBlacklist = ["Nokia201", "Nokia111", "Nokia6110", "SAMSUNG-SGH-E250", "SAMSUNG-GT-E2220", "BlackBerry8520"];

module.exports = function() {
    return function(req, res, next) {
      if (!util.isReqTypeAsserts(req) && isGumtreeZA(req) && isRedirectToMobileWebSite(req) ) {
        res.redirect(getHomePageUrl());
        return;
      }
      next();
    }
};


function isGumtreeZA(req) {
    return str((req.hostname).toUpperCase()).contains(("gumtree.co.za").toUpperCase());
}
function isRedirectToLiteWebSite(req) {
   return hasLiteBlacklistedKeywords(req);
}

function isRedirectToMobileWebSite(req) {
    return hasBlacklistedKeywords(req);
}

var hasBlacklistedKeywords = function(req) {
    // ua = "BlackBerry9300/5.0.0.977 Profile/MIDP-2.1 Configuration/CLDC-1.1 VendorID/167";
    return checkBlackbery(blackList, req);
};

var hasLiteBlacklistedKeywords = function(req) {
   // console.log("checkBlackbery(liteBlacklist, req) " + checkBlackbery(liteBlacklist, req));
    return checkBlackbery(liteBlacklist, req);
};


function checkBlackbery(list, req) {
    // get the user agent
    ua = req.headers['user-agent'];

    var doesExist = false;
    list.forEach(function(item){
        if (str(ua.toUpperCase()).contains(item.toUpperCase())) {
            doesExist = true;
        }
    });
    return doesExist;
}

function getHomePageUrl() {
    return "http://m.gumtree.co.za";
}

function getPostAdPageUrl(){
    return "http://m.gumtree.co.za/pa";
}

function getLoginPageUrl(){
    return "https://m.gumtree.co.za/login";
}
