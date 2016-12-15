'use strict';

let googleRanges = [];
let googleMarker = [];
// this is a mock location
let locationMexicoMock = { lat: 23.0876058, lng: -101.8926682 };

class FormMap {
	constructor() {
		this.HtmlMap = $("#map");
		this.HtmlAutocomplete = $("#autocompleteTextBox");
		this.HtmlEnableLocation = $("#checkGeolocation");
		this.HtmlSetLocation = $("#setCurrentLocationButton");
		this.googleMap = $(".form-map-component").data("google-map");
		this.postLocation = $(".form-map-component").data("post-location");
		this.zoom = 17;
		this.accuracy = 5;
		this.map;
		this.placeSearch;
		this.autocomplete;
		this.useGeolocation;
		this.position = this.googleMap.location;
		this.meters = this.googleMap.sizeRadio;
		this.icons = {
			current: '/public/icons/map/location-current.svg',
			fakeAd: '/public/icons/map/location-marker.svg'
		};
	}

	expandViewportToFitPlace(map, place) {
		if (place.geometry.viewport) {
			map.fitBounds(place.geometry.viewport);
			map.setZoom(this.zoom);
		} else {
			map.setCenter(place.geometry.location);
			map.setZoom(this.zoom);
		}
	}

	initAutocomplete() {
		this.autocomplete = new google.maps.places.Autocomplete(this.HtmlAutocomplete[0], { types: ['geocode'] });
		this.autocomplete.bindTo('bounds', this.map);

		let that = this.autocomplete;
		this.autocomplete.addListener('place_changed', () => {
			let place = that.getPlace();
			this.HtmlAutocomplete.removeClass("error");
			if (!place.geometry) {
				this.HtmlAutocomplete.addClass("error");
				this.HtmlAutocomplete.blur();
				return;
			} else {
				this.HtmlAutocomplete.blur();
				this.expandViewportToFitPlace(this.map, place);
				this.setLocation();
			}
		});
	}

	configMap() {

		let tempzoom = locationMexicoMock ? 4 : this.zoom;
		this.map = new google.maps.Map(this.HtmlMap[0], {
			center: locationMexicoMock,
			zoom: tempzoom,
			disableDefaultUI: true,
		});

		this.HtmlSetLocation.addClass("active");
		this.HtmlAutocomplete.addClass("inactive");
		this.map.addListener('dragend', () => {
			this.setLocation();
		});
		this.initAutocomplete();
		this.setLocation();

	}

	setLocation() {
		this.removeAllMarker();
		this.removeAllRanges();
		this.addRange(this.meters);
	}

	getLocation() {
		let value = this.HtmlEnableLocation[0].checked;
		this.geolocate(value);
	}

	getPosition() {
		let cords = this.map.getCenter();
		let pos = {
			lat: cords.lat(),
			lng: cords.lng()
		};
		return pos;
	}

	setCurrentPosition() {
		let latLng = new google.maps.LatLng(this.position.lat, this.position.lng);
		this.map.setCenter(latLng);
		this.map.setZoom(this.zoom);
		this.removeAllMarker();
		this.removeAllRanges();
		this.addRange(this.meters);
		this.HtmlAutocomplete.val();
	}

	geolocate() {
		// the coords is the map of mexico { lat: 23.3650375, lng: -111.5740098 }
		this.position = this.position ? this.position : this.googleMap.location;

		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition (function(position) {

				let geolocation = {
					lat: position.coords.latitude,
					lng: position.coords.longitude
				};
				this.position = geolocation;
			});
		}
		if(this.map) {
			this.map.setCenter(this.position);
			this.map.setZoom(this.zoom);
			this.removeAllMarker();
			this.removeAllRanges();
			this.addRange(this.meters);
		}
	}

	addRange(meters) {
		let center = this.map.getCenter();
		let tempRange = new google.maps.Circle({
			strokeColor: '#FF9800',
			strokeOpacity: 0.8,
			strokeWeight: 2,
			fillColor: '#FF9800',
			fillOpacity: 0.35,
			center: center,
			radius: Math.sqrt(meters) * this.accuracy
		});
		tempRange.setMap(this.map);
		googleRanges.push(tempRange);
	}

	removeAllRanges() {
		for (let i = 0; i < googleRanges.length; i++) {
			googleRanges[i].setMap(null);
		}
		googleRanges = new Array();
	}

	randomNumber(value, range) {
		let result = 0;
		let real = (" " + value).split(".")[0];
		let decimal = (" " + value).split(".")[1];
		let minimunRange = decimal - range;
		let maximusRange = decimal + range;
		result = Math.round(Math.random() * (maximusRange - minimunRange) + minimunRange);

		return parseFloat(real + "." + result);
	}

	addFakeLocation() {
		let center = this.map.getCenter();
		let radius = (Math.sqrt(this.meters) * this.meters) * 2;
		let fkLat = this.randomNumber(center.lat(), radius);
		let fkLng = this.randomNumber(center.lng(), radius);
		let fakePosition = { lat: fkLat, lng: fkLng };
		let label = googleMarker.length === 0 ? "Current Location" : "Fake Location";
		let icon = googleMarker.length === 0 ? this.icons.current : this.icons.fakeAd;

		let tempMarker = new google.maps.Marker({
			position: fakePosition,
			title: label,
			icon: icon
		});

		tempMarker.setMap(this.map);
		googleMarker.push(tempMarker);
	}

	addMarker() {
		let center = this.map.getCenter();
		let label = googleMarker.length === 0 ? "Current Location" : "Fake Location";
		let icon = googleMarker.length === 0 ? this.icons.current : this.icons.fakeAd;

		let tempMarker = new google.maps.Marker({
			position: center,
			title: label,
			icon: icon
		});

		tempMarker.setMap(this.map);
		googleMarker.push(tempMarker);
	}

	addMarkerCustom(lat, lng) {
		let center = { lat: lat, lng: lng };
		let tempMarker = new google.maps.Marker({
			position: center,
			title: 'MyLocation'
		});
		tempMarker.setMap(this.map);
		googleMarker.push(tempMarker);
	}

	removeAllMarker() {
		for (let i = 0; i < googleMarker.length; i++) {
			googleMarker[i].setMap(null);
		}
		googleMarker = new Array();
	}
}

let initialize = () => {
	window.formMap = new FormMap();
	// set the current location via data in node
	window.formMap.configMap();
	window.formMap.position = this.googleMap.location;
	window.googleRanges = googleRanges;
	window.googleMarker = googleMarker;


	window.formMap.HtmlSetLocation.click(() => {
		window.formMap.geolocate();
		window.formMap.setCurrentPosition();
	});

	window.formMap.HtmlAutocomplete.focus(() => {
		window.formMap.geolocate();
	});

	window.formMap.HtmlEnableLocation.change(() => {
		window.formMap.getLocation();
	});
};


module.exports = {
	initialize
};
