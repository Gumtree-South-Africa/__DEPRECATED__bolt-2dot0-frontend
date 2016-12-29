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
				$('.confirm-button').removeClass('disable-click');
				$('.change-loc').removeClass('hidden');
			}
		},
		error: () => {
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
 * Modal Related
 */
let _openModal = () => {
	document.addEventListener('touchmove', _preventDefault, false);
	$('#locationModal').removeClass('hiddenElt');
	$('body').addClass('stop-scrolling');
	$('.modal-input').val('');
	$('.modal-input').focus();
	$('.confirm-button').addClass('disable-click');
	$('.change-loc').addClass('hidden');
};

let _refreshPage = () => {
	location.reload(true);
};

let _closeModal = () => {
	document.removeEventListener('touchmove', _preventDefault, false);
	$('body').removeClass('stop-scrolling');
	if (this.setValueCb) {
		this.setValueCb(this.valueCbLocation);
	} else {
		this.$locationInput.val(escape(this.searchLocIdCookieOldValue));
		this.$locationText.text(this.$locmodal.val());
	}
};


/**
 * Initialize
 * Sets up module for use and binds events to the dom
 */
let initialize = (setValueCb) => {
	this.$locale = $('html').attr('data-locale');
	this.$locmodal = $('#modal-location');
	this.$locationInput = $('[name=locId]');
	this.$locationText = $('.location-text');
	this.$modal = $('#locationModal');

	this.langs = this.$locale.split('_')[0];
	this.country = this.$locale.split('_')[1];

	this.setValueCb = setValueCb;
	this.valueCbLocation = null;

	this.setNewCookieValues = false;
	this.settingCookieAgain = null;

	// Event handling on modal
	let $modalCp = $('.modal-cp');

	$('.card-title-cp, .location-link').on('click', () => {
		_openModal(this.$locmodal);
	});

	$('.card-title').on('click', function() {
		$modalCp.removeClass('hiddenElt');
	});

	$('.modal-closearea, .modal-cp .btn, .modal-cp .modal-overlay').on('click', () => {
		$modalCp.addClass('hiddenElt');
		$('#modal-location').removeClass('spinner').attr('disabled', false);
		$('body').removeClass('stop-scrolling');
		document.removeEventListener('touchmove', _preventDefault, false);
	});

	// close clicked
	$('.modal-closearea').on('click', () => {
		_resetCookieValues();
	});

	// Escape key listener
	this.$locmodal.on('keyup', (evt) => {
		switch (evt.keyCode) {
			case 27:
				_resetCookieValues();
				$modalCp.addClass('hiddenElt');
				$('#modal-location').removeClass('spinner').attr('disabled', false);
				$('body').removeClass('stop-scrolling');
				document.removeEventListener('touchmove', _preventDefault, false);
				break;
			default:
				break;
		}
	});

	// confirm button
	$('.modal-cp .btn').on('click', (ev) => {
		ev.preventDefault();
		ev.stopPropagation();
		_closeModal();
	});

	// gps icon
	$('.modal-cp .icon-location-v2').on('click', function() {
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
		_geoAutoComplete();
	});

};


module.exports = {
	initialize
};
