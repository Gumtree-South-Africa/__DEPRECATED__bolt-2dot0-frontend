var Q = require("q");


module.exports = function(siteApp) {

    return function(req, rep, next) {

        siteApp.config = {};
        siteApp.config.name = siteObj.name;
        siteApp.config.locale = siteObj.locale;
        siteApp.config.country = siteObj.country;
        siteApp.config.hostname = siteObj.hostname;
        siteApp.config.hostnameRegex = '[\.-\w]*' + siteObj.hostname + '[\.-\w-]*';

// Set BAPI Config Data
        console.log("Calling ConfigService to get ConfigData");
        Q(configService.getConfigData(siteApp.config.locale))
            .then(function (dataReturned) {
                siteApp.config.bapiConfigData = dataReturned;
            }).fail(function (err) {
            console.log("Error in ConfigService, reverting to local files:- ", err);
            siteApp.config.bapiConfigData = require('./server/config/bapi/config_' + siteApp.config.locale + '.json');
        });


        next();
    }



};