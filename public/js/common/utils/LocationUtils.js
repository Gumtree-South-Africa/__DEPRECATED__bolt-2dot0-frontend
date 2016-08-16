'use strict';

// Retrieve cookie by name
let _getCookie = (name) => {
	var value = "; " + document.cookie;
	var parts = value.split("; " + name + "=");
	if (parts.length == 2) {
		return parts.pop().split(";").shift();
	}
	return null;
};

let LocationUtils = {
	getLocationId: (successCallback, errorCallback) => {
		$.ajax({
			url: '/api/locate/locationlatlong',
			type: 'GET',
			success: successCallback,
			error: errorCallback
		});
	}
};

module.exports = LocationUtils;
