'use strict';

let CookieUtils = require("./CookieUtils");

let LocationUtils = {
	getLocationId: (successCallback, errorCallback) => {
		if (CookieUtils.getCookie('searchLocId')) {
			return {
				id: CookieUtils.getCookie('searchLocId')
			}
		} else {
			$.ajax({
				url: '/api/locate/locationlatlong',
				type: 'GET',
				success: (res) => {
					document.cookie = 'locId=' + res.id;
					successCallback(res);
				},
				error: errorCallback
			});
		}
	}
};

module.exports = LocationUtils;
