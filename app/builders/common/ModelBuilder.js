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

	//returns an unformatted lat/long for general purpose use, or null if no cookie present or improperly formed
	getGeoFromCookieUnformatted(geoIdCookie) {

		let geoIdCookieValue = ((typeof geoIdCookie === 'undefined') || geoIdCookie === '') ? null : geoIdCookie;

		if (geoIdCookieValue !== null) {
			let splitDelim = 'ng';
			let geoIdSplit = geoIdCookieValue.split(splitDelim);
			if (geoIdSplit.length !== 2) {
				console.error(`received badly formatted geoId cookie, tried to split using ${splitDelim} for: ${geoIdCookie}, cookie ignored`);
				return null;
			}
			if (Number.isNaN(Number.parseFloat(geoIdSplit[0])) || Number.isNaN(Number.parseFloat(geoIdSplit[1]))) {
				console.error(`received badly formatted geoId cookie, lat/long do not parse for: ${geoIdCookie}, cookie ignored`);
				return null;
			}
			return {
				lat: geoIdSplit[0],
				lng: geoIdSplit[1]
			};
		}

		return null;
	}

	initModelData(resLocals, appLocals, cookies) {
		let config = resLocals.config;
		return {
			env: 'public',
			locale: config.locale,
			country: config.country,
			lang: config.locale.split('_')[0],
			site: config.name,
			pagename: appLocals.pagetype,
			device: appLocals.deviceInfo,
			ip: appLocals.ip,
			machineid: appLocals.machineid,
			useragent: appLocals.useragent,
			b2dot0Version: resLocals.b2dot0Version,
			b2dot0PageVersion: resLocals.b2dot0PageVersion,

			// creating a { lat: , lng: } object then consume that, formatting as needed
			// consuming services require format (<lat>,<long>) use bapiService.bapiFormatLatLng()
			// as of 8/11 the cookie is only set from the client, so no server side formatting into cookie format is done

			// null if cookie is not present
			geoLatLngObj: this.getGeoFromCookieUnformatted(cookies.geoId),

			// Cached Location Data from BAPI
			location: config.locationData,
			locationdropdown: config.locationdropdown,
			locationIdNameMap: config.locationIdNameMap,

			// Cached Category Data from BAPI
			category: config.categoryData,
			categoryDropdown: config.categoryDropdown,
			categoryAll: config.categoryAllData,
			locationAll: config.locationAllData,

			categoryIdNameMap: config.categoryIdNameMap,
			categoryData: config.categoryflattened,

			// Bapi Header Data
			bapiHeaders: {
				requestId: appLocals.requestId,
				ip: appLocals.ip,
				machineid: appLocals.machineid,
				useragent: appLocals.useragent,
				locale: config.locale,
				authTokenValue: cookies.bt_auth
			}
		};
	}
}


module.exports = ModelBuilder;
