'use strict';

let _bindTypeAheadResultsEvents = () => {
	let $resultsRows = this.$modal.find(".ac-field");

	$resultsRows.on('mouseenter', (evt) => {
		let $active = this.$modal.find(".active");

		// they have mouse entered after having selected one via arrow keys
		// clear out the old selection
		if ($active.length !== 0) {
			$active.removeClass("active");
		}

		$(evt.currentTarget).addClass("active");
	});

	$resultsRows.on('mouseleave', (evt) => {
		$(evt.currentTarget).removeClass("active");
	});
};

/**
 * Auto-Complete for Location via Google
 * @param country
 * @param lang
 * @param inputVal
 * @private
 */
let _getGeoCodeData = (country, lang, inputVal) => {
	let htmlElt = '';
	$.ajax({
		//TODO: use proper google account key
		url: 'https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyB8Bl9yJHqPve3b9b4KdBo3ISqdlM8RDhs&&components=country:' + country + '&language=' + lang + '&address=' + inputVal,
		dataType: 'JSON',
		type: 'GET',
		success: function(resp) {
			if (resp.results instanceof Array) {
				let autocompleteField = $('#autocompleteField');
				autocompleteField.html('');
				if (resp.results.length > 0) {
					autocompleteField.removeClass('hiddenElt');
					for (let idx = 0; idx < resp.results.length; idx++) {
						let address = resp.results[idx].formatted_address;
						let latitude = resp.results[idx].geometry.location.lat;
						let longitude = resp.results[idx].geometry.location.lng;
						let splitAddress = address.split(',');
						let partialAddy = (splitAddress.length < 2) ? splitAddress[splitAddress.length - 1] : (splitAddress[splitAddress.length - 2] + splitAddress[splitAddress.length - 1]);
						htmlElt += "<div class='ac-field' data-long=" + longitude + " data-lat=" + latitude + "><span class='suffix-addy hiddenElt'>" + partialAddy + "</span><span class='full-addy'>" + address + "</span></div>";
					}

					autocompleteField.append(htmlElt);
					_bindTypeAheadResultsEvents();
				} else {
					autocompleteField.addClass('hiddenElt');
				}
			}
		}
	});
};

let _refreshPage = () => {
	location.reload(true);
};

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
	geoCookieValue = geoCookieValue.replace('ng', ',');
	$.ajax({
		url: '/api/locate/locationlatlong',
		type: 'GET',
		success: (resp) => {
			$('#modal-location').removeClass('spinner').attr('disabled', false);
			if (resp !== undefined) {
				$('.search-textbox-container .location-text').html(resp.localizedName);
				$('#modal-location').val(resp.localizedName);

				// Set searchLocId and searchLocName Cookie
				document.cookie = 'searchLocId' + "=" + escape(resp.id) + ";path=/";
				document.cookie = 'searchLocName' + "=" + escape(resp.localizedName) + ";path=/";
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
	document.cookie = 'geoId' + "=" + escape(cookieValue) + ";path=/";

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



// ACTIONS ---------------------------------------------------------------------------

let _openModal = () => {
	$('#locationModal').removeClass('hiddenElt');
};

let _closeModal = () => {
	let $selected = $('.ac-field.selected');
	let location = {
		lat: $selected.attr('data-lat'),
		long: $selected.attr('data-long')
	};
	if ($selected.attr('data-long') !== undefined) {
		if (this.setValueCb) {
			this.setValueCb(location);
		}
	}

	// refresh page
	_refreshPage();
};

let _populateACData = (evt) => {
	$(evt.currentTarget).removeClass('selected').addClass('selected');
	$('#autocompleteField').addClass('hiddenElt');

	let $selected = $('.ac-field.selected');
	let location = {
		lat: $selected.attr('data-lat'),
		long: $selected.attr('data-long')
	};
	_setGeoCookie(location);
};

let _selectItem = () => {
	let $active = this.$modal.find(".active");
	if ($active.length !== 0) {
		$active.click();
	}
};

let _highlightUpItem = () => {
	let $active = this.$modal.find(".active");

	if ($active.length === 0) {
		$active = this.$modal.find(".ac-field").last();
		$active.addClass("active");
	} else {
		$active.removeClass("active").prev(".ac-field").addClass("active");
	}

	this.$autocompleteField.animate({
		scrollTop: $active.position().top + $("#autocompleteField").scrollTop() - 50
	}, 'fast');
};

let _highlightDownItem = () => {
	let $active = this.$modal.find(".active");

	if ($active.length === 0) {
		$active = this.$modal.find(".ac-field").first();
		$active.addClass("active");
	} else {
		$active.removeClass("active").next(".ac-field").addClass("active");
	}

	this.$autocompleteField.animate({
		scrollTop: $active.position().top + $("#autocompleteField").scrollTop()
	}, 'fast');
};


/**
 * Sets up module for use and binds events to the dom
 */
let initialize = (setValueCb) => {
	this.$locale = $('html').attr('data-locale');
	this.$locmodal = $('#modal-location');
	this.$autocompleteField = $('#autocompleteField');
	this.$modal = $('#locationModal');

	this.langs = this.$locale.split('_')[0];
	this.country = this.$locale.split('_')[1];

	this.setValueCb = setValueCb;

	let eventName = 'keyup';
	let $modalCp = $('.modal-cp');

	this.$locmodal.on(eventName, (evt) => {
		switch (evt.keyCode) {
			case 38:
				//up
				_highlightUpItem();
				evt.preventDefault();
				break;
			case 40:
				//down
				_highlightDownItem();
				evt.preventDefault();
				break;
			case 13:
				//enter
				_selectItem();
				evt.preventDefault();
				break;
			default:
				_getGeoCodeData(this.country, this.langs, this.$locmodal.val());
				break;
		}
	});

	$('.card-title-cp, .location-link').on('click', () => {
		_openModal(this.$locmodal);
	});

	this.$autocompleteField.on('click', '.ac-field', (e) => {
		_populateACData(e);
	});

	$(':not(#autocompleteField)').on('click', () => {
		this.$autocompleteField.addClass('hiddenElt');
	});

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

	//click on gps icon
	$('.modal-cp .icon-location-v2').on('click', function() {
		$('#modal-location').addClass('spinner').attr('disabled', true);
		_geoFindMe();
	});

};


module.exports = {
	initialize
};
