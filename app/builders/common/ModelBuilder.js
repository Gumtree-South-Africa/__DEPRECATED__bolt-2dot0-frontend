'use strict';

let Q = require('q');
let _ = require('underscore');

/**
 * @description A class that Handles the Page Model
 * @param [{Object}]} arrFunctions List of functions to be executed
 * @constructor
 */
class ModelBuilder {

	constructor(functionList) {
		// Logger.log("*** CREATING MODEL....");
		this.data = {};

		if (typeof functionList !== 'undefined' && functionList instanceof Array) {
			this.setCallsList(functionList);
		}
	}

	/**
	 * @method setCallsList
	 * @description Sets the list (array) of function calls
	 * @param arrFunctions List of functions to be executed
	 * @public
	 */
	setCallsList(arrFunctions) {
		this.arrFunctions = arrFunctions;
	}

	resolveAllPromises(functions) {
		if (!functions) {
			functions = this.arrFunctions;
		}
		let promises = functions.map((fn) => {
			return (_.isFunction(fn)) ? fn() : fn;
		});
		return Q.all(promises);
	}

	getGeoFromCookie(geoIdCookie) {
		let geoValue = null;

		let geoIdCookieValue = ((typeof geoIdCookie === 'undefined') || geoIdCookie === '') ? null : geoIdCookie;

		if (geoIdCookieValue !== null) {
			let geoIdSplit = geoIdCookieValue.split('ng');
			let geoLat = geoIdSplit[0];
			let geoLng = geoIdSplit[1];
			geoValue = '(' + geoLat + ',' + geoLng + ')';
		}

		return geoValue;
	}

	initModelData(config, locals, cookies) {
		return {
			env: 'public',
			locale: config.locale,
			country: config.country,
			site: config.name,
			pagename: locals.pagetype,
			device: locals.deviceInfo,
			ip: locals.ip,
			machineid: locals.machineid,
			useragent: locals.useragent,
			geoLatLng: this.getGeoFromCookie(cookies.geoId),
			geoCookie: cookies.geoId,
			// Cached Location Data from BAPI
			location: config.locationData,
			locationdropdown: config.locationdropdown,
			locationIdNameMap: config.locationIdNameMap,

			// Cached Category Data from BAPI
			category: config.categoryData,
			categoryDropdown: config.categoryDropdown,

			categoryIdNameMap: config.categoryIdNameMap,
			categoryData: config.categoryflattened,

			// Bapi Header Data
			bapiHeaders: {
				requestId: locals.requestId,
				ip: locals.ip,
				machineid: locals.machineid,
				useragent: locals.useragent,
				locale: config.locale,
				authTokenValue: cookies.bt_auth
			}
		};
	}
}


module.exports = ModelBuilder;
