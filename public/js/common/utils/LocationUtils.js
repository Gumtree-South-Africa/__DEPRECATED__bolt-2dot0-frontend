'use strict';

let CookieUtils = require("./CookieUtils");

let LocationUtils = {
	getLocationId: (successCallback, errorCallback) => {
		let cookieVal = CookieUtils.getCookie('searchLocId');
		if (cookieVal) {
			successCallback({
				id: cookieVal
			});
		} else {
			$.ajax({
				url: '/api/locate/locationlatlong',
				type: 'GET',
				success: (res) => {
					document.cookie = 'searchLocId=' + res.id;
					successCallback(res);
				},
				error: errorCallback
			});
		}
	}
};

module.exports = LocationUtils;
