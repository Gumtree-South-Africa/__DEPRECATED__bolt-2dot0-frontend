/**
 * Created by aganeshalingam on 1/27/16.
 */

'use strict';

var str = require('string'),
    ua;// userAgent

var blackList = ["blackberry8520", "sgh-e250i", "series40", "series60",
    "opera mini", "opera mobi", "n905i", "blackberry9300/5", "BLACKBERRY9300", "BLACKBERRY 9300", "lumia 520"];

var liteBlacklist = ["Nokia201", "Nokia111", "Nokia6110", "SAMSUNG-SGH-E250", "SAMSUNG-GT-E2220", "BlackBerry8520"];

module.exports = function() {
    return function(req, res, next) {
        if (isGumtreeZA(req) ) {

            if (isRedirectToLiteWebSite(req)) {
                res.redirect(getLiteHomePageUrl());
            } else if (shouldRedirectToMobileWebSite) {
                res.redirect(getHomePageUrl());
            }

            // if nothing works go to current homepage
            res.redirect("/");
        }
        next();
    }
};


function isGumtreeZA(req) {
    return str(req.originalUrl.toUpperCase()).contains(("gumtree.co.za").toUpperCase());
}
function isRedirectToLiteWebSite(res) {
   return hasBlacklistedKeywords();
}

function shouldRedirectToMobileWebSite(res) {
    return hasBlacklistedKeywords();
}

var hasBlacklistedKeywords = function(req) {

    // ua = "BlackBerry9300/5.0.0.977 Profile/MIDP-2.1 Configuration/CLDC-1.1 VendorID/167";
    return checkBlackbery(blackList);
};

var hasLiteBlacklistedKeywords = function(req) {

    return checkBlackbery(liteBlacklist);
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

function getLiteHomePageUrl(){
    return "http://lite.gumtree.co.za";
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