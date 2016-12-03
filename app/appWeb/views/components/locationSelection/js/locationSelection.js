'use strict';

let CookieUtils = require("public/js/common/utils/CookieUtils.js");


/**
 * Given a geoId cookie:
 * 1. talk to BAPI to retreive the location info
 * 2. set in the page
 * 3. set searchLocId, searchLocName cookie
 * 4. Refresh Page
 * @param geoCookieValue
 * @private
 */
let _geoShowMyLocation = (geoCookieValue) => {
	let location = {
		lat: geoCookieValue.split('ng')[0],
		long: geoCookieValue.split('ng')[1]
	};
	$.ajax({
		url: '/api/locate/locationlatlong',
		data: {
			lat: location.lat,
			lng: location.long,
			leaf: ((typeof this.setValueCb === 'undefined') || (this.setValueCb === null)) ? false : true
		},
		type: 'GET',
		success: (resp) => {
			$('#modal-location').removeClass('spinner').attr('disabled', false);
			if (resp !== undefined) {
				this.$locationLat.val(location.lat);
				this.$locationLng.val(location.long);
				// Set searchLocId and searchLocName Cookie only if no Cb specified
				if ((typeof this.setValueCb === 'undefined') || (this.setValueCb === null)) {
					let searchLocIdValue = escape(resp.id);
					if (searchLocIdValue!==null && searchLocIdValue!=='') {
						CookieUtils.setCookie('searchLocId', searchLocIdValue, 365);
					}
					let searchLocNameValue = escape(resp.localizedName);
					if (searchLocNameValue!==null && searchLocNameValue!=='') {
						CookieUtils.setCookie('searchLocName', searchLocNameValue, 365);
					}
				} else {
					this.valueCbLocation = location;
					this.valueCbLocation.localizedName = resp.localizedName;
				}
				this.setNewCookieValues = true;

				$('.search-textbox-container .location-text').html(resp.localizedName);
				$('#modal-location').val(resp.localizedName);
				$('#locationId').val(resp.id);
				$('.confirm-button').removeClass('disable-click');
				$('.change-loc').removeClass('hidden');
			}
		},
		error: () => {
			window.BOLT.trackEvents({"event": "AutomaticLocationFail"});
			$('#modal-location').removeClass('spinner').attr('disabled', false);
		}
	});
};

/**
 * Store the current cookie values for later reset if needed.
 * @private
 */
let _getCurrentCookieValues = () => {
	if (this.settingCookieAgain === 0) {
		this.geoIdCookieOldValue = unescape(CookieUtils.getCookie('geoId'));
		this.searchLocIdCookieOldValue = unescape(CookieUtils.getCookie('searchLocId'));
		this.searchLocNameCookieOldValue = unescape(CookieUtils.getCookie('searchLocName'));
	}
};

/**
 * Reset the cookie values to what was before entering the location modal.
 * @private
 */
let _resetCookieValues = () => {
	if (this.setNewCookieValues) {
		let geoIdValue = escape(this.geoIdCookieOldValue);
		if (geoIdValue!==null && geoIdValue!=='') {
			CookieUtils.setCookie('geoId', geoIdValue, 365);
		} else {
			CookieUtils.setCookie('geoId', geoIdValue, -1);
		}
		let searchLocIdValue = escape(this.searchLocIdCookieOldValue);
		if (searchLocIdValue!==null && searchLocIdValue!=='') {
			CookieUtils.setCookie('searchLocId', searchLocIdValue, 365);
		} else {
			CookieUtils.setCookie('searchLocId', searchLocIdValue, -1);
		}
		let searchLocNameValue = escape(this.searchLocNameCookieOldValue);
		if (searchLocNameValue!==null && searchLocNameValue!=='') {
			CookieUtils.setCookie('searchLocName', searchLocNameValue, 365);
		} else {
			CookieUtils.setCookie('searchLocName', searchLocNameValue, -1);
		}
		this.valueCbLocation = null;
	}
};

/**
 * Set geoId Cookie
 * @param location
 * @private
 */
let _setGeoCookie = (location) => {
	this.settingCookieAgain = (this.settingCookieAgain === null) ? 0 : this.settingCookieAgain + 1;
	_getCurrentCookieValues();
	let geoCookieValue = location.lat + 'ng' + location.long;

	// Set geoId cookie only if no Cb specified
	if ((typeof this.setValueCb === 'undefined') || (this.setValueCb === null)) {
		CookieUtils.setCookie('geoId', escape(geoCookieValue), 365);
	}

	_geoShowMyLocation(escape(geoCookieValue));
};

/**
 * Use GPS to find the current location.
 * @private
 */
let _geoFindMe = () => {
	function success(position) {
		let latitude = position.coords.latitude;
		let longitude = position.coords.longitude;
		let location = {
			lat: latitude,
			long: longitude
		};
		_setGeoCookie(location);
	}

	function error() {
		console.error('Unable to retrieve your location');
		$('#modal-location').removeClass('spinner').attr('disabled', false);
		window.BOLT.trackEvents({"event": "AutomaticLocationFail"});
	}

	if (!navigator.geolocation) {
		console.error('Geolocation is not supported by your browser');
		error();
		return;
	}
	navigator.geolocation.getCurrentPosition(success, error);
};

/**
 * Auto-Complete for Location via Google
 * @param country
 * @param lang
 * @param inputVal
 * @private
 */
let _geoAutoComplete = () => {
	let $place = this.$autocomplete.getPlace();
	let latitude = $place.geometry.location.lat();
	let longitude = $place.geometry.location.lng();
	let location = {
		lat: latitude,
		long: longitude
	};
	_setGeoCookie(location);
};

let _preventDefault = (e) => {
	e.preventDefault();
};

/**
 * Initialize
 * Sets up module for use and binds events to the dom
 */
let initialize = (setValueCb, options) => {
	this.$locale = $('html').attr('data-locale');
	this.$locmodal = $('#modal-location');
	this.$modal = $('#locationModal');

	this.$locationLat = this.$modal.find('#location-lat');
	this.$locationLng = this.$modal.find('#location-lng');

	this.langs = this.$locale.split('_')[0];
	this.country = this.$locale.split('_')[1];

	this.setValueCb = setValueCb;
	this.valueCbLocation = null;

	this.setNewCookieValues = false;
	this.settingCookieAgain = null;

	// Escape key listener
	this.$locmodal.on('keyup', (evt) => {
		switch (evt.keyCode) {
			case 27:
				_resetCookieValues();
				$('#modal-location').removeClass('spinner').attr('disabled', false);
				$('body').removeClass('stop-scrolling');
				document.removeEventListener('touchmove', _preventDefault, false);
				break;
			default:
				break;
		}
	});

	// gps icon
	$('.current-location').on('click', function(e) {
		e.preventDefault();
		e.stopImmediatePropagation();
		window.BOLT.trackEvents({"event": options.pageType + "CurrentLocation"});
		$('#modal-location').addClass('spinner').attr('disabled', true);
		_geoFindMe();
	});

	// google autocomplete
	this.$autocomplete = new google.maps.places.Autocomplete(
		/** @type {!HTMLInputElement} */(document.getElementById('modal-location')),
		{
			types: ['(regions)'],
			componentRestrictions: {'country': this.country}
		}
	);
	google.maps.event.addListener(this.$autocomplete, 'place_changed', function() {
		$('#modal-location').addClass('spinner').attr('disabled', true);
		window.BOLT.trackEvents({"event": options.pageType + "ManualLocation"});
		_geoAutoComplete();
	});

};

let getLocationId = () => {
	return $('#locationId').val();
};


module.exports = {
	initialize,
	getLocationId
};
