/**
 * Created by aganeshalingam on 1/27/16.
 */


'use strict';

var device = require('device'),
    deviceInfo = {
        isPhone: false,
        isDesktop: false,
        isTablet: false,
        isTV: false
    };



module.exports.init = function() {
    return function(req, res, next) {

        detectDevice(req);
        next();
    };
};

module.exports.isDesktop = function() {
    return deviceInfo.isDesktop;
};

// for backend
module.exports.check = function(req) {
    detectDevice(req);
};

module.exports.isMobile = function() {
    return deviceInfo.isMobile;
};

module.exports.isTablet = function() {
    return deviceInfo.isTablet;
};

module.exports.isTv = function() {
    return deviceInfo.isTv;
};

function detectDevice(req) {

    // determin the device from user agent string
    var theDevice = device.useragent_is(req.headers['user-agent']);

    deviceInfo.isDesktop = false;
    deviceInfo.isMobile = false;
    deviceInfo.isTablet = false;
    deviceInfo.isTv = false;


    console.log("detectDevice xxxxxxxxxxxxxx" + theDevice.type + "xxxx" + req.headers['user-agent']);

    switch( theDevice.type ) {

        case "desktop" :
            deviceInfo.isDesktop = true;
            break;
        case "phone" :
            deviceInfo.isMobile = true;
            break;
        case "tablet" :
            deviceInfo.isTablet = true;
            break;
        case "tv" :
            deviceInfo.isTv = true;
            break;
        default:
            console.log("something went wrong getting user agent");
    }
    req.app.locals.deviceInfo = deviceInfo;
}