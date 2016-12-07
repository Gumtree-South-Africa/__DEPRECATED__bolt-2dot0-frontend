'use strict';

let googleCircles = [];
let googleMarker = [];
class FormMap {
	constructor() {
		this.htmlElements = {
			autocomplete: "autocompleteTextBox",
			map: "map",
			geolocation: "checkGeolocation",
			setLocation: "setLocationButton"
		};
		this.zoom = 14;
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
		let element = document.getElementById(this.htmlElements.autocomplete);
		this.autocomplete = new google.maps.places.Autocomplete(element, { types: ['geocode'] });
		this.autocomplete.bindTo('bounds', this.map);

		let that = this.autocomplete;
		this.autocomplete.addListener('place_changed', () => {
			let place = that.getPlace();
			$("#" + this.htmlElements.autocomplete).removeClass("error");
			if (!place.geometry) {
				$("#" + this.htmlElements.autocomplete).addClass("error");
				$("#" + this.htmlElements.autocomplete).blur();
				return;
			} else {
				$("#" + this.htmlElements.autocomplete).blur();
				this.expandViewportToFitPlace(this.map, place);
			}
		});
	}

	configMap() {
		let mapDiv = document.getElementById(this.htmlElements.map);
		this.map = new google.maps.Map(mapDiv, {
			center: this.position,
			zoom: this.zoom,
			disableDefaultUI: true
		});
		
		this.map.addListener('center_changed', () => {
			$("#" + this.htmlElements.setLocation).addClass("active");
			$("#" + this.htmlElements.autocomplete).addClass("inactive");
		});
		this.initAutocomplete();
		this.setLocation();
	}

	setLocation() {
		$("#" + this.htmlElements.setLocation).removeClass("active");
		$("#" + this.htmlElements.autocomplete).removeClass("inactive");

		$("#" + this.htmlElements.setLocation).addClass("inactive");
		$("#" + this.htmlElements.autocomplete).addClass("active");

		this.removeAllMarker();
		this.removeAllCircles();
		this.addMarker();
		this.addCircle(2);
	}

	getLocation() {
		let value = document.getElementById(this.htmlElements.geolocation).checked;
		this.geolocate(value);
	}

	geolocate(enable) {
		if (enable) {
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition((position) => {
					let geolocation = {
						lat: position.coords.latitude,
						lng: position.coords.longitude
					};
					let circle = new google.maps.Circle({
						center: geolocation,
						radius: position.coords.accuracy
					});
					this.autocomplete.setBounds(circle.getBounds());
					this.position = geolocation;
				});
			}
		} else {
			this.position = { lat: 19.3883554, lng: -99.1744351 };
		}
	}

	addCircle(km) {
		let center = this.map.getCenter();
		let tempCicle = new google.maps.Circle({
			strokeColor: '#FF9800',
			strokeOpacity: 0.8,
			strokeWeight: 2,
			fillColor: '#FF9800',
			fillOpacity: 0.35,
			center: center,
			radius: Math.sqrt(km) * 1000
		});
		tempCicle.setMap(this.map);
		googleCircles.push(tempCicle);
	}

	removeAllCircles() {
		for(let i=0; i < googleCircles.length; i++) {
			googleCircles[i].setMap(null);
		}
		googleCircles = new Array();
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
	window.googleCircles = googleCircles;
	window.googleMarker = googleMarker;
};


module.exports = {
	initialize
};