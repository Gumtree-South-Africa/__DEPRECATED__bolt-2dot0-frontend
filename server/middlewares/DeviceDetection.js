/**
 * Created by aganeshalingam on 1/27/16.
 */


'use strict';

var device = require('device');



module.exports = function() {
    return function(req, res, next) {

        detectDevice(req);
        next();
    };
};

function detectDevice(req) {

    // determin the device from user agent string
    var theDevice = device.useragent_is(req.headers['user-agent']);

    req.com.ecg.bolt.config.isDesktop = false;
    req.com.ecg.bolt.config.isMobile = false;
    req.com.ecg.bolt.config.tablet = false;
    req.com.ecg.bolt.config.tv = false;

    console.log("detectDevice xxxxxxxxxxxxxx" + theDevice.type + "xxxx" + req.headers['user-agent']);

    switch( theDevice.type ) {

        case "desktop" :
            req.com.ecg.bolt.config.isDesktop = true;
            break;
        case "mobile" :
            req.com.ecg.bolt.config.isMobile = true;
            break;
        case "tablet" :
            req.com.ecg.bolt.config.tablet = true;
            break;
        case "tv" :
            req.com.ecg.bolt.config.tablet = true;
            break;
        default:
            console.log("something went wrong getting user agent");
    }
}