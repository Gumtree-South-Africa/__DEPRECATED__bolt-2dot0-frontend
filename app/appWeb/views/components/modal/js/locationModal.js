'use strict';

let $ = require("jquery");

let _getGeoCodeData = (country, lang, inputVal) => {
	let htmlElt = '';
	$.ajax({
			//TODO: use proper google account key
			url: 'https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyB8Bl9yJHqPve3b9b4KdBo3ISqdlM8RDhs&components=country:' + country + '&language='+ lang + '&address=' + inputVal,
			dataType: 'JSON',
			type: 'GET',
			success: function(resp) {
				if (resp.results instanceof Array) {
						$('#autocompleteField').html('');
						if (resp.results.length > 0) {
								$('#autocompleteField').removeClass('hiddenElt');
								for (let idx = 0; idx < resp.results.length; idx++) {
										let address = resp.results[idx].formatted_address;
										let latitude = resp.results[idx].geometry.location.lat;
										let longitude = resp.results[idx].geometry.location.lng;
										let splitAddress = address.split(',');
										let partialAddy = (splitAddress.length < 2) ? splitAddress[splitAddress.length-1] : (splitAddress[splitAddress.length-2] + splitAddress[splitAddress.length-1]);
										htmlElt += "<div class='ac-field' data-long=" + longitude + " data-lat=" + latitude + "><span class='suffix-addy hiddenElt'>" + partialAddy + "</span><span class='full-addy'>" + address + "</span></div>";
								}
								$('#autocompleteField').append(htmlElt);
						} else {
								$('#autocompleteField').addClass('hiddenElt');
						}
				}
			}
	});
};

/*
*  this method will be used when trending card and/or other module can refresh by themselves
*/
// let _geoShowMyLocation = (geoCookieValue) => {
// 	geoCookieValue = geoCookieValue.replace('ng',',');
// 	$.ajax({
// 		url: '/api/locate/locationlatlong',
// 		type: 'GET',
// 		success: (resp) => {
//
// 			$('#modal-location').removeClass('spinner').attr('disabled', false);
// 				if(resp !== undefined) {
// 			 		$('.search-textbox-container .location-text').html(resp.localizedName);
// 			   	$('#modal-location').val(resp.localizedName);
// 			  }
// 		  }
// 	});
// };

let _geoFindMe = () => {
	if (!navigator.geolocation) {
		console.error('Geolocation is not supported by your browser');
		return;
	}
	function success(position) {
		let latitude  = position.coords.latitude;
		let longitude = position.coords.longitude;
		document.cookie = 'geoId' + "=" + escape(latitude + 'ng' + longitude) + ";path=/";
		//_geoShowMyLocation(escape(latitude + 'ng' + longitude));
	}
	function error() {
		console.error('Unable to retrieve your location');
	}
	navigator.geolocation.getCurrentPosition(success, error);
};

let _openModal = () => {
		$('#locationModal').removeClass('hiddenElt');
};

let _refreshPage = () => {
	location.reload(true);
};

let _closeModal = () => {
	let $selected = $('.ac-field.selected');
	let cookieValue = $selected.attr('data-lat') + 'ng' + $selected.attr('data-long');
	if($selected.attr('data-long') !== undefined) {
		document.cookie = 'geoId' + "=" + escape(cookieValue) + ";path=/";
	}
	_refreshPage();
};

let _populateACData = (evt) => {
	$(evt.currentTarget).removeClass('selected').addClass('selected');
	$('#autocompleteField').addClass('hiddenElt');
	$('#modal-location').val($(evt.currentTarget).find('.suffix-addy').html());
};


// let _getCookie = (cname) => {
// 	let name = cname + "=";
// 	let ca = document.cookie.split(';');
// 	for(let i = 0; i <ca.length; i++) {
// 		let c = ca[i];
// 		while (c.charAt(0)===' ') {
// 			c = c.substring(1);
// 		}
// 		if (c.indexOf(name) === 0) {
// 			return c.substring(name.length,c.length);
// 		}
// 	}
// 	return "";
// };

let _selectItem = () => {
	let $active = this.$modal.find(".active");
	if ($active.length !== 0) {
		$active.click();
	}
};

let _highlightPrevItem = () => {
	let $active = this.$modal.find(".active");
	if ($active.length === 0) {
		this.$locmodal.find(".ac-field").last().addClass("active");
	} else {
		$active.removeClass("active").prev(".ac-field").addClass("active");
	}
};

let _highlightNextItem = () => {
	let $active = this.$modal.find(".active");
	if ($active.length === 0) {
		this.$modal.find(".ac-field").first().addClass("active");
	} else {
		$active.removeClass("active").next(".ac-field").addClass("active");
	}
};


/**
 * Sets up module for use and binds events to the dom
 */
let initialize = () => {
	this.$locale = $('html').attr('data-locale');
	this.$locmodal = $('#modal-location');
	this.$autocompleteField = $('#autocompleteField');
	this.$modal = $('#locationModal');

	this.langs = this.$locale.split('_')[0];
	this.country = this.$locale.split('_')[1];

	let eventName = 'keyup';
	let $modalCp = $('.modal-cp');

	this.$locmodal.on(eventName, (evt) => {
		switch (evt.keyCode) {
			case 38:
				//up
				_highlightPrevItem();
				evt.preventDefault();
				break;
			case 40:
				//down
				_highlightNextItem();
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

	$('#autocompleteField').on('click', '.ac-field', (e) => {
			_populateACData(e);
	});

	$(':not(#autocompleteField)').on('click', () => {
			$('#autocompleteField').addClass('hiddenElt');
	});

	$('.modal-closearea, .modal-cp .btn, .modal-cp .modal-overlay').on('click', () => {
			$modalCp.addClass('hiddenElt');
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

	//on Initialize
	//_geoShowMyLocation(_getCookie('geoId'));

};


module.exports = {
	initialize
};
