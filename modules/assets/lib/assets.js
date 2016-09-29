/**
 * @module Assets
 * @description An assets libary that will extract js and css urls from.
 * @author aganeshalingam@ebay.com
 */

"use strict";

let cjson = require('cjson');
let json = cjson.load(process.cwd() + "/app/config/assets/jsmin.json");


let isLocalePresent = (locales, locale) => {
	if (Array.isArray(locales) ) {
		for(let i=0; i<locales.length; i++) {
			if (locales[i] === locale) {
				return true;
			}
		}
	}

	return false;
};

let getAssets = (locale) => {
	let jsArry = [];

	json.forEach(function(site) {
		let localeOk = isLocalePresent(site.locales, locale);

		if (localeOk ) {
			site.src.forEach(function(jsUrl){
				jsArry.push(jsUrl);
			});
		}
	});
	return jsArry;
};


module.exports = function(app, locale) {
    return function(req, res, next) {
		res.locals.jsAssets = getAssets(locale);

		next();
    };
};


