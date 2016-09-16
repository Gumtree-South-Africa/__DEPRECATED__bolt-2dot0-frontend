'use strict';


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
			lng: location.long
		},
		type: 'GET',
		success: (resp) => {
			$('#modal-location').removeClass('spinner').attr('disabled', false);
			if (resp !== undefined) {
				// Set searchLocId and searchLocName Cookie only if no Cb specified
				if ((typeof this.setValueCb === 'undefined') || (this.setValueCb === null)) {
					document.cookie = 'searchLocId' + "=" + escape(resp.id) + ";path=/";
					document.cookie = 'searchLocName' + "=" + escape(resp.localizedName) + ";path=/";
				} else {
					this.valueCbLocation = location;
					this.valueCbLocation.localizedName = resp.localizedName;
				}

				$('.search-textbox-container .location-text').html(resp.localizedName);
				$('#modal-location').val(resp.localizedName);
				$('.login-button').removeClass('disable-click');
			}
		},
		error: () => {
			$('#modal-location').removeClass('spinner').attr('disabled', false);
		}
	});
};

/**
 * Set geoId Cookie
 * @param location
 * @private
 */
let _setGeoCookie = (location) => {
	let cookieValue = location.lat + 'ng' + location.long;

	// Set geoId cookie only if no Cb specified
	if ((typeof this.setValueCb === 'undefined') || (this.setValueCb === null)) {
		document.cookie = 'geoId' + "=" + escape(cookieValue) + ";path=/";
	}

	_geoShowMyLocation(escape(cookieValue));
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
}


/**
 * Modal Related
 */
let _openModal = () => {
	$('#locationModal').removeClass('hiddenElt');
	$('body').addClass('stop-scrolling');
	$('.login-button').addClass('disable-click');
};

let _refreshPage = () => {
	location.reload(true);
};

let _closeModal = () => {
	$('body').removeClass('stop-scrolling');
	if (this.setValueCb) {
		this.setValueCb(this.valueCbLocation);
	} else {
		_refreshPage();
	}
};


/**
 * Initialize
 * Sets up module for use and binds events to the dom
 */
let initialize = (setValueCb) => {
	this.$locale = $('html').attr('data-locale');
	this.$locmodal = $('#modal-location');
	this.$modal = $('#locationModal');

	this.langs = this.$locale.split('_')[0];
	this.country = this.$locale.split('_')[1];

	this.setValueCb = setValueCb;
	this.valueCbLocation = null;

	// Event handling on modal
	$('.card-title-cp, .location-link').on('click', () => {
		_openModal(this.$locmodal);
	});

	let $modalCp = $('.modal-cp');
	$('.modal-closearea, .modal-cp .btn, .modal-cp .modal-overlay').on('click', () => {
		$modalCp.addClass('hiddenElt');
		$('#modal-location').removeClass('spinner').attr('disabled', false);
	});

	$('.card-title-cp').on('click', function() {
		$modalCp.removeClass('hiddenElt');
	});

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
		_geoAutoComplete();
	});

};


module.exports = {
	initialize
};
