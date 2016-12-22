'use strict';

let googleRanges = [];
let googleMarker = [];
// this is a mock location 
let locationMock = { lat: 19.3883633, lng: -99.1744249 };
let locationMexicoMock = { lat: 23.49125085380051, lng: -100.15682835625 };
let getUrlParameter = (sParam) => {
	let sPageURL = decodeURIComponent(window.location.search.substring(1)),
		sURLVariables = sPageURL.split('&'),
		sParameterName,
		i;

	for (i = 0; i < sURLVariables.length; i++) {
		sParameterName = sURLVariables[i].split('=');

		if (sParameterName[0] === sParam) {
			return sParameterName[1] === undefined ? true : sParameterName[1];
		}
	}
};

class FormMap {
	constructor() {
		this.HtmlMap = $("#map");
		this.HtmlAutocomplete = $("#autocompleteTextBox");
		this.HtmlEnableLocation = $("#checkGeolocation");
		this.HtmlSetLocation = $("#setCurrentLocationButton");
		this.zoom = 17;
		this.accuracy = 5;
		this.map;
		this.placeSearch;
		this.autocomplete;
		this.useGeolocation;
		this.position = locationMexicoMock;
		this.currentLocation;
		this.meters = 1000;
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
		this.map = new google.maps.Map(this.HtmlMap[0], {
			center: locationMexicoMock,
			zoom: 4,
			disableDefaultUI: true
		});
		google.maps.event.trigger(this.map, "resize");
		this.map.setOptions({draggable: false, zoomControl: false, scrollwheel: false, disableDoubleClickZoom: true});
		this.HtmlSetLocation.addClass("active");
		this.HtmlAutocomplete.addClass("inactive");
		this.map.addListener('dragend', () => {
			this.setLocation();
		});
	
		this.map.addListener('idle',() => {
			google.maps.event.trigger(this.map, "resize");
		});
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
		this.position = this.position ? this.position : locationMock;
		try	{
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition ((gps) => {
					this.position.lat = gps.coords.latitude;
					this.position.lng = gps.coords.longitude;
				});
			}
		} catch(error) {
			this.position = this.position ? this.position : locationMock;
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
	window.getUrlParameter = getUrlParameter;
	let validator = window.getUrlParameter('BOLT24812');
	window.formMap = new FormMap();
	if(validator || validator === 1) {
		// set the current location via data in node
		window.formMap.configMap();
		window.googleRanges = googleRanges;
		window.googleMarker = googleMarker;
		window.locationMexicoMock = locationMexicoMock;
	}
	
};


module.exports = {
	initialize
};