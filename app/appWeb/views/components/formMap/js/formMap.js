'use strict';

let googleRanges = [];
let googleMarker = [];
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
		this.position = { lat: 19.3883554, lng: -99.1744351 };
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
			center: this.position,
			zoom: this.zoom,
			disableDefaultUI: true
		});
		
		this.HtmlSetLocation.addClass("active");
		this.HtmlAutocomplete.addClass("inactive");
		// this.map.addListener('center_changed', () => {
		// 	// this.HtmlSetLocation.addClass("active");
		// 	// this.HtmlAutocomplete.addClass("inactive");
			
		// });
		this.initAutocomplete();
		this.setLocation();
	}

	setLocation() {
		// this.HtmlSetLocation.removeClass("active");
		// this.HtmlAutocomplete.removeClass("inactive");

		// this.HtmlSetLocation.addClass("inactive");
		// this.HtmlAutocomplete.addClass("active");
		this.map.setZoom(this.zoom);
		this.removeAllMarker();
		this.removeAllRanges();
		this.addMarker();
		this.addRange(500);
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
		this.addMarker();
		this.addRange(500);
	}

	geolocate(enable) {
		if (enable) {
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(function(position) {
					let geolocation = {
						lat: position.coords.latitude,
						lng: position.coords.longitude
					};
					let circle = new google.maps.Circle({
						center: geolocation,
						radius: position.coords.accuracy,
						map: this.map,
					});
					this.autocomplete.setBounds(circle.getBounds());
					this.map.setCenter(geolocation);
					this.map.setZoom(this.zoom);
					this.removeAllMarker();
					this.removeAllRanges();
					this.addMarker();
					this.addRange(500);
				});
			}
		} else {
			this.position = { lat: 19.3883554, lng: -99.1744351 };
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
		// console.log(tempRange.radius);
		tempRange.setMap(this.map);
		googleRanges.push(tempRange);
	}

	removeAllRanges() {
		for(let i=0; i < googleRanges.length; i++) {
			googleRanges[i].setMap(null);
		}
		googleRanges = new Array();
	}

	addMarker() {
		let center = this.map.getCenter();
		let tempMarker = new google.maps.Marker({
			position: center,
			title: 'MyLocation'
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
		for(let i=0; i < googleMarker.length; i++) {
			googleMarker[i].setMap(null);
		}
		googleMarker = new Array();
	}
}

let initialize = () => {
	window.formMap = new FormMap();
	window.formMap.geolocate(true);
	window.googleRanges = googleRanges;
	window.googleMarker = googleMarker;

	window.formMap.HtmlSetLocation.click(() => {
		window.formMap.setCurrentPosition();
	});
};


module.exports = {
	initialize
};