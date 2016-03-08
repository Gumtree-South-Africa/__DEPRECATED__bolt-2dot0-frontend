'use strict';


var exphbs  = require('express-handlebars');
var glob = require('glob');
var http = require('http');
var path = require('path');
var vhost = require('vhost');
var Q = require('q');
var _ = require('underscore');
var cuid = require('cuid');


// middleware
var expressbuilder = require('./server/middlewares/express-builder');
var checksite = require('./server/middlewares/check-site');
var error = require('./modules/error');


// app
var controllers = glob.sync(process.cwd() + '/app/controllers/**/*.js');
var config = require('./server/config/sites.json');

// services
var configService = require(process.cwd() + '/server/services/configservice');
var locationService = require(process.cwd() + '/server/services/location');
var categoryService = require(process.cwd() + '/server/services/category');

// Default list of all locales, if new locales are added, add it in this list
var allLocales = 'es_MX,es_AR,es_US,en_ZA,en_IE,pl_PL,en_SG';
// If SITES param is passed as input param, load only those countries
var siteLocales = process.env.SITES || allLocales;


/*
 * Create Main App
 */
var app = new expressbuilder().getApp();
var requestId = cuid();
var siteCount = 0;

/**
 * @method prepareDataForRendering
 * @description Gets a JSON tree and returns 2 data objects. The first one is the flat list to
 *     be rendered as a dropdown object {id : "", localizedName : "", children: {}} (children key
 *     will be there only if this node has child nodes). The second and optional object is a map with the format { id :  localizedName}. 
 * @param {Object} dataReturned Original JSON structure
 * @param {Boolean} buildMapRequired Truth value to determine if we need to build a (flat) map with
 *     {key : value} 
 * @public
 * @return {JSON} in the format { dropdown : {} , map : {}}
 */
function prepareDataForRendering(dataReturned, buildMapRequired) {
	// Build Location ID-Name Map
	var dataMap = {},
		dataDropdown,
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


/*
 * Create Site Apps
 */
var siteApps = [];
Object.keys(config.sites).forEach(function(siteKey) {
    var siteObj = config.sites[siteKey];

    if (siteLocales.indexOf(siteObj.locale) > -1) {
	      (function(siteObj) {
		        var builderObj = new expressbuilder(siteObj.locale);
		        var siteApp = builderObj.getApp();
		
		        // send site information along
		        siteApp.locals.config = {};
		        siteApp.locals.config.name = siteObj.name;
		        siteApp.locals.config.locale = siteObj.locale;
		        siteApp.locals.config.country = siteObj.country;
		        siteApp.locals.config.hostname = siteObj.hostname;
		        siteApp.locals.config.hostnameRegex = '[\.-\w]*' + siteObj.hostname + '[\.-\w-]*';
		
		        // Load Config Data from BAPI
		        Q(configService.getConfigData(siteApp.locals.config.locale))
		      	  .then(function (dataReturned) {
		      		if (dataReturned.error !== null) {
		      			siteApp.locals.config.bapiConfigData = require('./server/config/bapi/config_' + siteApp.locals.config.locale + '.json');
		      		} else {
		      			siteApp.locals.config.bapiConfigData = dataReturned;
		      		}
		  		}).fail(function (err) {
		  			console.warn('Startup: Error in ConfigService, reverting to local files:- ', err);
		  			siteApp.locals.config.bapiConfigData = require('./server/config/bapi/config_' + siteApp.locals.config.locale + '.json');
		  		});

		        // Load Location Data from BAPI
		        Q(locationService.getLocationsData(requestId, siteApp.locals.config.locale, 2))
		    	  .then(function (dataReturned) {
		    		siteApp.locals.config.locationData = dataReturned;
		    		
					var filteredData = prepareDataForRendering(dataReturned, true);
					siteApp.locals.config.locationIdNameMap = filteredData.map;
		    		siteApp.locals.config.locationdropdown = filteredData.dropdown;
		    	}).fail(function (err) {
				    console.warn('Startup: Error in loading locations from LocationService:- ', err);
				});

		        // Load Category Data from BAPI
		        Q(categoryService.getCategoriesData(requestId, siteApp.locals.config.locale, 2))
		    	  .then(function (dataReturned) {
		    	    siteApp.locals.config.categoryData = dataReturned;
					var filteredData = prepareDataForRendering(dataReturned, false);
		    		siteApp.locals.config.categorydropdown = filteredData.dropdown; // categorydropdown;
				}).fail(function (err) {
					console.warn('Startup: Error in loading categories from CategoryService:- ', err);
				});

		        // Template hbs caching.
		        // See: https://github.com/ericf/express-handlebars#template-caching
		        // Enables view template compilation caching and is enabled in production by default.
		        if (process.env.NODE_ENV) {
		          siteApp.enable('view cache');
		        }
		
		        // register bolt middleware
		        siteApp.use(checksite(siteApp));


		        // Setup Vhost per supported site
		        app.use(vhost(new RegExp(siteApp.locals.config.hostnameRegex), siteApp));
	      })(siteObj);
      
	      siteCount = siteCount + 1;
    }
 });


// Setup controllers
controllers.forEach(function (controller) {
    require(controller)(app);
});


// Warning: do not reorder this middleware. 
// Order of this should always appear after controller middlewares are setup.
app.use(error.four_o_four(app));

// Overwriting the express's default error handler should always appear after 404 middleware
app.use(error(app));

module.exports = app;


function clearRequireCache(mod) {
	//console.log(mod);
  	Object.keys(require.cache).forEach(function(key) {
  		if (key.indexOf(mod) > -1) {
  			delete require.cache[key];
		}
  	});
}

function requireUncached(module){
	delete require.cache[require.resolve(module)];
    return require(module);
}
