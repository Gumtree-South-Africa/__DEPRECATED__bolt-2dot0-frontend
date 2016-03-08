'use strict';

var Q = require('q');
var pCwd = process.cwd();

// services
var configService = require(pCwd + '/server/services/configservice');
var locationService = require(pCwd + '/server/services/location');
var categoryService = require(pCwd + '/server/services/category');

module.exports = function(siteApp, requestId) {
  // @vrajendiran: Please help convert this to middleware
  //  return function(req, res, next) {

        var DP = LocationCategoryData(siteApp, requestId);

        // Load Config Data from BAPI
        DP.loadConfigData();

         // Load Location Data from BAPI
        DP.loadLocationData();

         // Load Category Data from BAPI
        DP.loadCategoryData();

        // call next middleware
        // next();
 //   };
};

/**
 * @method prepareDataForRendering
 * @description Gets a JSON tree and returns 2 data objects. The first one is the flat list to
 *     be rendered as a dropdown object {id : "", localizedName : "", children: {}} (children key
 *     will be there only if this node has child nodes). The second and optional object is a map with the format { id :  localizedName}. 
 * @param {Object} dataReturned Original JSON structure
 * @param {Boolean} buildMapRequired Truth value to determine if we need to build a (flat) map with
 *     {key : value} 
 * @private
 * @return {JSON} in the format { dropdown : {} , map : {}}
 */
function prepareDataForRendering(dataReturned, buildMapRequired) {
    // Build Location ID-Name Map
    var dataMap = {},
        dataDropdown = {},
        key,
        key2,
        level1,
        level2,
        level1Data,
        level2Data;

    // Define initial Map object
    if (buildMapRequired) {
        dataMap[dataReturned.id] = {
            'value': dataReturned.localizedName,
            'level': dataReturned.level
        };
    }

    // Define initial Dropdown object
    dataDropdown = {
        'id' : dataReturned.id,
        'localizedName' : dataReturned.localizedName,
        'children' : []
    };

    // Iterate thru original data set and build the dropdown data and
    // the map if required.
    for (key in dataReturned.children) {
        level1 = dataReturned.children[key];

        if (buildMapRequired) {
            dataMap[level1.id] = level1.localizedName;
        }

        level1Data = {
            'id' : level1.id,
            'localizedName' : level1.localizedName,
            'children' : []
        };

        for (key2 in level1.children) {
            level2 = level1.children[key2];

            if (buildMapRequired) {
                dataMap[level2.id] = level2.localizedName;
            }
            
            level2Data = {
                'id' : level2.id,
                'localizedName' : level2.localizedName
            };

            level1Data.children.push(level2Data);
        }
        
        dataDropdown.children.push(level1Data);
    }

    return {
        'dropdown' : dataDropdown,
        'map' : dataMap
    };

}

/**
 * @class LocationCategoryData (Singleton)
 * @constructor
 * @description Retrieves a list of methods that fetch the loc/cat data by making
 *     BAPI calls
 * @param {Object} siteApp The Site App
 * @param {String} requestId ID of the current CUID request
 */
function LocationCategoryData(siteApp, requestId) {

    return {

        /**
         * @method loadConfigData
         * @description Loads the Config Data from BAPI. Exposes that data via
         *     siteApp.locals.config.bapiConfigData
         * @private
         */
        loadConfigData : function () {
            // Load Config Data from BAPI
            Q(configService.getConfigData(siteApp.locals.config.locale))
              .then(function (dataReturned) {
                if (dataReturned.error !== null) {
                    siteApp.locals.config.bapiConfigData = require(pCwd + '/server/config/bapi/config_' + siteApp.locals.config.locale + '.json');
                } else {
                    siteApp.locals.config.bapiConfigData = dataReturned;
                }
            }).fail(function (err) {
                console.warn('Startup: Error in ConfigService, reverting to local files:- ', err);
                siteApp.locals.config.bapiConfigData = require(pCwd + '/server/config/bapi/config_' + siteApp.locals.config.locale + '.json');
            });
        },

        /**
         * @method loadLocationData
         * @description Loads the Location Data from BAPI. Exposes that data via
         *     siteApp.locals.config.locationIdNameMap and siteApp.locals.config.locationdropdown
         * @private
         */
        loadLocationData : function () {
            var filteredData;

            // Load Location Data from BAPI
            Q(locationService.getLocationsData(requestId, siteApp.locals.config.locale, 2))
              .then(function (dataReturned) {
                siteApp.locals.config.locationData = dataReturned;
                
                filteredData = prepareDataForRendering(dataReturned, true);
                siteApp.locals.config.locationIdNameMap = filteredData.map;
                siteApp.locals.config.locationdropdown = filteredData.dropdown;
            }).fail(function (err) {
                console.warn('Startup: Error in loading locations from LocationService:- ', err);
            });
        },

        /**
         * @method loadCategoryData
         * @description Loads the Category Data from BAPI. Exposes that data via
         *      siteApp.locals.config.categorydropdown
         * @private
         */
        loadCategoryData : function () {
            var filteredData;

            // Load Category Data from BAPI
            Q(categoryService.getCategoriesData(requestId, siteApp.locals.config.locale, 2))
              .then(function (dataReturned) {
                siteApp.locals.config.categoryData = dataReturned;
                filteredData = prepareDataForRendering(dataReturned, false);
                siteApp.locals.config.categorydropdown = filteredData.dropdown; // categorydropdown;
            }).fail(function (err) {
                console.warn('Startup: Error in loading categories from CategoryService:- ', err);
            });

        }

    };
}

