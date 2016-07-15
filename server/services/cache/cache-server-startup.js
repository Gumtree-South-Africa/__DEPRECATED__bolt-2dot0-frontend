'use strict';


var Q = require('q');
var pCwd = process.cwd();

// services
var configService = require(pCwd + '/server/services/configservice');
var locationService = require(pCwd + '/server/services/location');
var categoryService = require(pCwd + '/server/services/category');


module.exports = function(siteApp, requestId) {
    var Cache = CacheBapiData(siteApp, requestId);

    // Load Config Data from BAPI
    return Cache.loadConfigData();
};

module.exports.updateConfig = function(locale, requestId) {
	var Cache = CacheBapiData(null, requestId);

	return Cache.updateConfigData(locale);
}

/**
 * @class CacheBapiData (Singleton)
 * @constructor
 * @description Retrieves a list of methods that fetch the config/loc/cat data by making BAPI calls
 * @param {Object} siteApp The Site App
 * @param {String} requestId ID of the current CUID request
 */
function CacheBapiData(siteApp, requestId) {

    /**
     * @method loadLocationData
     * @description Loads the Location Data from BAPI. Exposes that data via
     *     siteApp.locals.config.locationIdNameMap and siteApp.locals.config.locationdropdown
     * @private
     */
    var loadLocationData = function (bapiHeaders, locationDepth) {
        var filteredData;

        // Load Location Data from BAPI
        return Q(locationService.getLocationsData(bapiHeaders, locationDepth))
            .then(function (dataReturned) {
                siteApp.locals.config.locationData = dataReturned;

                filteredData = prepareDataForRendering(dataReturned, true, locationDepth);
                siteApp.locals.config.locationIdNameMap = filteredData.map;
                siteApp.locals.config.locationdropdown = filteredData.dropdown;
            }).fail(function (err) {
                console.warn('Startup: Error in loading locations from LocationService:- ', err);
            });
    };

    /**
     * @method loadCategoryData
     * @description Loads the Category Data from BAPI. Exposes that data via
     *      siteApp.locals.config.categoryDropdown
     * @private
     */
    var loadCategoryData = function (bapiHeaders, categoryDepth) {
        var filteredData, flattenedData;

        // Load Category Data from BAPI
        return Q(categoryService.getCategoriesData(bapiHeaders, categoryDepth))
            .then(function (dataReturned) {
                siteApp.locals.config.categoryData = dataReturned;

                filteredData = prepareDataForRendering(dataReturned, true, categoryDepth);
                siteApp.locals.config.categoryIdNameMap = filteredData.map;
                siteApp.locals.config.categoryDropdown = filteredData.dropdown;

                flattenedData = flattenTree(dataReturned);
                siteApp.locals.config.categoryflattened = flattenedData;
            }).fail(function (err) {
                console.warn('Startup: Error in loading categories from CategoryService:- ', err);
            });
    };


    return {

		/**
		 * @method updateConfigData
		 * @description Updates the Configuration for a given locale
		 * @param locale
		 */
		updateConfigData : function (locale) {
			var bapiHeaders = {};
			bapiHeaders.locale = locale;
			bapiHeaders.requestId = requestId;

			var configData = require(pCwd + '/server/config/bapi/config_' + locale + '.json');

			// Update config in BAPI
			return Q(configService.updateConfigData(bapiHeaders, JSON.stringify(configData)))
				.then(function (dataReturned) {
					console.log('Startup: Success in updating ZK config (dev mode) in ConfigService:- ', dataReturned);
				}).fail(function (err) {
					console.warn('Startup: Error in updating ' + locale + ' ZK config (dev mode) in ConfigService:- ', err);
				});
		},

        /**
         * @method loadConfigData
         * @description Loads the Config Data from BAPI. Exposes that data via
         *     siteApp.locals.config.bapiConfigData
         * @private
         */
        loadConfigData : function () {
            var bapiHeaders = {};
            bapiHeaders.requestId = requestId;
            bapiHeaders.locale = siteApp.locals.config.locale;

            // Load Config Data from BAPI
	        // Actually return the promise so we know when the app is ready to start.
            return Q(configService.getConfigData(bapiHeaders))
              .then(function (dataReturned) {

                if (typeof dataReturned.error !== 'undefined' && dataReturned.error !== null) {
					console.warn(`picking up bapi config locally due to error ${dataReturned.error}`);
                    siteApp.locals.config.bapiConfigData = require(pCwd + '/server/config/bapi/config_' + siteApp.locals.config.locale + '.json');
 					console.warn(`models: ${siteApp.locals.config.bapiConfigData.bapi.Homepage.desktop.models} for locale ${siteApp.locals.config.locale}`);
                } else {
                    siteApp.locals.config.bapiConfigData = dataReturned;
                }

                var locationDropdownLevel = siteApp.locals.config.bapiConfigData.header.locationDropdownLevel;
                var categoryDropdownLevel = siteApp.locals.config.bapiConfigData.header.categoryDropdownLevel;

                // Load Location Data from BAPI
	              let locations = loadLocationData(bapiHeaders, locationDropdownLevel);

                // Load Category Data from BAPI
	              let categories = loadCategoryData(bapiHeaders, categoryDropdownLevel);
	              return Q.all([locations, categories]);
            }).catch((err) => {
                console.warn('Startup: Error in ConfigService, reverting to local files:- ', err);
                siteApp.locals.config.bapiConfigData = require(pCwd + '/server/config/bapi/config_' + siteApp.locals.config.locale + '.json');
                  let locationDropdownLevel = siteApp.locals.config.bapiConfigData.header.locationDropdownLevel;
                  let categoryDropdownLevel = siteApp.locals.config.bapiConfigData.header.categoryDropdownLevel;
                  let locations = loadLocationData(bapiHeaders, locationDropdownLevel);

                // Load Category Data from BAPI
	              let categories = loadCategoryData(bapiHeaders, categoryDropdownLevel);
	              return Q.all([locations, categories]);
            });
        }

    };
}

/**
 * @method prepareDataForRendering
 * @description Gets a JSON tree and returns 2 data objects. The first one is the flat list to
 *     be rendered as a dropdown object {id : "", localizedName : "", children: {}} (children key
 *     will be there only if this node has child nodes). The second and optional object is a map with the format { id :  localizedName}.
 * @param {Object} dataReturned Original JSON structure
 * @param {Boolean} buildMapRequired Truth value to determine if we need to build a (flat) map with
 *     {key : value}
 * @param {Number} depth The levels to transverse of the original data returned JSON (currently max 2)
 * @private
 * @return {JSON} in the format { dropdown : {} , map : {}}
 */
function prepareDataForRendering(dataReturned, buildMapRequired, depth) {
    if (!depth || (typeof depth !== "number") || (depth > 2) || (depth < 0)) {
        depth = 1;
    }

    // Build Location ID-Name Map
    var dataMap = {},
        dataDropdown = {},
        key,
        key2,
        level1,
        level2,
        level1Data,
        level2Data;

    if (depth > 0) {
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

            if (depth == 2) {
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
            }

            dataDropdown.children.push(level1Data);
        }
    }

    return {
        'dropdown' : dataDropdown,
        'map' : dataMap
    };
}

function flattenTree(dataReturned) {

    var flattenedData = {},
        level1,
        level2,
        levelData,
        key,
        key2;

    flattenedData = {
        'nodes' : []
    };

    for (key in dataReturned.children) {
        level1 = dataReturned.children[key];
        for (key2 in level1.children) {
            level2 = level1.children[key2];

            levelData = {
                'id' : level2.id,
                'localizedName' : (typeof level2.localizedMobileName !== 'undefined') ? level2.localizedMobileName : level2.localizedName,
                'level1Id': level1.id
            };

            flattenedData.nodes.push(levelData);
        }
    }

    return flattenedData;
}
