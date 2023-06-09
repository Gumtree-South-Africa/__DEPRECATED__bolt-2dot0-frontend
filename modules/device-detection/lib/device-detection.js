/**
 * Created by aganeshalingam on 1/27/16.
 */

'use strict';

var device = require('device'),
    str = require('string'),
    deviceInfo = {
        isPhone: false,
        isDesktop: false,
        isTablet: false,
        isTV: false
    }, ua = null;



module.exports.init = function() {
    return function(req, res, next) {

        detectDevice(req);
        next();
    };
};

module.exports.isDesktop = function() {
    return deviceInfo.isDesktop;
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

module.exports.isHomePageDevice = function() {

    // Mozilla/5.0 (ipad; CPU OS 6_1_3 like Mac OS X)AppleWebKit/536.26(KHTML, like Gecko)Version/6.0 Mobile/10B329 Safari/8536.25
    //Mozilla/5.0 (iPad; CPU OS 4_3_5 like Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8L1 Safari/6533.18.5
    // Mozilla/5.0 (Linux; U; Android 2.2; en-us; SCH-I800 Build/FROYO) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1
    //Mozilla/5.0(Ipad;CPU OS 6_1_3 like Mac OS X) AppliWebKit/536.26 (KHTML,like Gecko) Version/6.0 Mobile/10B329 Safari/8536.25
    //SamSung tablet :Android 4.2.2
    //UA :Mozilla/5.0(Linux;U;Android 4.2.2;en-us;GT-P5210 Build/JDQ39) AppliWebKit/534.30 (KHTML,like Gecko) Version/4.0 Safari/534.30
    //Ipad mini :IOS6.1.3
    //UA :Mozilla/5.0(Ipad;CPU OS 6_1_3 like Mac OS X) AppliWebKit/536.26 (KHTML,like Gecko) Version/6.0 Mobile/10B329 Safari/8536.25
    //Ipad mini : IOS 7.1 also can reproduce it
    //UA :Mozilla/5.0(Ipad;CPU OS 7_1 like Mac OS X) AppliWebKit/537.51.2 (KHTML,like Gecko) Version/7.0 Mobile/11D167Safari/9537.53

    if ( ua != null && str(ua.toUpperCase()).contains(("ipad").toUpperCase()) && str(ua).contains("AppleWebKit/533")) return true;
    if ( ua != null && str(ua.toUpperCase()).contains(("ipad").toUpperCase()) && str(ua).contains("AppleWebKit/536")) return true;
    if ( ua != null && str(ua.toUpperCase()).contains(("ipad").toUpperCase()) && str(ua).contains("AppleWebKit/537")) return true;
    if ( ua != null && str(ua.toUpperCase()).contains(("SCH-I800").toUpperCase()) && str(ua).contains("AppleWebKit/533")) return true;
    if ( ua != null && str(ua.toUpperCase()).contains(("SM-T210R").toUpperCase()) && str(ua).contains("AppleWebKit/534")) return true;
    if ( ua != null && str(ua.toUpperCase()).contains(("GT-P5210").toUpperCase()) && str(ua).contains("AppleWebKit/534")) return true;
    if ( ua != null && str(ua.toUpperCase()).contains(("SGH-T999").toUpperCase()) && str(ua).contains("AppleWebKit/534")) return true;

    return false;
};


function detectDevice(req) {

    // determin the device from user agent string
    var theDevice = device.useragent_is(req.headers['user-agent']);

    deviceInfo.isDesktop = false;
    deviceInfo.isMobile = false;
    deviceInfo.isTablet = false;
    deviceInfo.isTv = false;

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
    ua = req.headers['user-agent'];
}
