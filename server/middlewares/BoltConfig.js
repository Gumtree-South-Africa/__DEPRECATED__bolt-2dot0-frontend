/**
 * Created by aganeshalingam on 1/27/16.
 */

module.exports = function() {
    return function(req, res, next) {

        if (req ) {
            req.com = req.com || {};
            req.com.ecg = req.com.ecg || {};
            req.com.ecg.bolt = req.com.ecg.bolt || {};
            req.com.ecg.bolt.config = req.com.ecg.bolt.config || {};
            //console.log("BoltConfig " + req.com.ecg.bolt.config);
        }

        next();
    };
};

var config = {
    isPhone : false,
    isDesktop: false,
    isTablet:false,
    isTV: false
};

