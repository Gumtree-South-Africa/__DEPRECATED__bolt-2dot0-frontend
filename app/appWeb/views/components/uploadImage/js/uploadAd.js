"use strict";

let postAd = (imageArray, successCallback, failureCallback, options) => {
	let fields = options || {};
	let getCookie = (cname) => {
		let name = cname + "=";
		let ca = document.cookie.split(';');
		for (let i = 0; i < ca.length; i++) {
			let c = ca[i];
			while (c.charAt(0) === ' ') {
				c = c.substring(1);
			}
			if (c.indexOf(name) === 0) {
				return c.substring(name.length, c.length);
			}
		}
		return "";
	};
	let geoCookie = getCookie('geoId');
	let lat, lng;
	/*eslint-disable */
	if (geoCookie !== "") {
		let latLng = geoCookie.split('ng');
		lat = Number(latLng[0]);
		lng = Number(latLng[1]);
	} else if (google.loader.ClientLocation) {
		lat = Number(google.loader.ClientLocation.latitude);
		lng = Number(google.loader.ClientLocation.longitude);
		/*eslint-enable*/
	} else {
		console.warn('no geolocation provided');
	}

	let payload = {
		"ads": [
			{
				"title": fields.title,
				"imageURLs": imageArray
			}
		]
	};
	if (lat && lng) {
		payload.ads.forEach((ad) => {
			ad.location = {
				"address": fields.address,
				"latitude": lat,
				"longitude": lng
			};
		});
	}

	$.ajax({
		url: '/api/postad/create',
		type: 'POST',
		data: JSON.stringify(payload),
		dataType: 'json',
		contentType: "application/json",
		success: successCallback,
		error: failureCallback
	});
};

module.exports = {
	postAd
};
