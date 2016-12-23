'use strict';

let googleRanges = [];
let googleMarker = [];

class FormMap {
	constructor() {
		this.HtmlMap = $("#map");
		this.HtmlAutocomplete = $("#autocompleteTextBox");
		this.errorMessageMap = $(".errorMessageMap");
		this.HtmlEnableLocation = $("#checkGeolocation");
		this.HtmlSetLocation = $("#setCurrentLocationButton");
		this.googleMap = $(".form-map-component").data("google-map");
		this.locationAd = $(".form-map-component").data("location-ad");
		this.zoom = this.googleMap.zoom;
		this.accuracy = this.googleMap.accuracy;
		this.map;
		this.placeSearch;
		this.autocomplete;
		this.validationCoordinates = {};
		this.useGeolocation;
		this.meters = this.googleMap.sizeRadio;
		this.icons = {
			current: '/public/icons/map/location-current.svg',
			fakeAd: '/public/icons/map/location-marker.svg'
		};
		this.validateCountry = (coordinates) => {
			return new Promise(function(success, reject) {
				if (!coordinates) {
			  	return success(false);
				}
				let geocoder = new google.maps.Geocoder(),
						latlng = new google.maps.LatLng(coordinates.lat, coordinates.lng);

				geocoder.geocode({'latLng': latlng}, function(results, status) {
					let countryShortName, i;
					try {
						if (status === 'OK') {
							if(results[0]) {
								for(i = 0; i < results[0].address_components.length; i++) {
									if(results[0].address_components[i].types[0] === "country") {
										countryShortName = results[0].address_components[i].short_name;
									}
								}
								if(countryShortName === window.formMap.country) {
									window.formMap.HtmlAutocomplete.val(results[0].formatted_address);
									success(coordinates);
								} else {
									window.formMap.errorMessageMap.html(window.formMap.googleMap.errorMessage).show();
								}
							}
						}
						success(false);
					} catch (ex) {
						reject(ex);
					}
				});
			});
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
		let tempzoom = this.locationAd ? this.zoom : 4;
		this.map = new google.maps.Map(this.HtmlMap[0], {
			center: window.formMap.position,
			zoom: tempzoom,
			disableDefaultUI: true,
			componentRestrictions: 'MX'
		});

		google.maps.event.trigger(this.map, "resize");
		this.map.setOptions({draggable: false, zoomControl: false, scrollwheel: false, disableDoubleClickZoom: true});
		this.HtmlSetLocation.addClass("active");
		this.HtmlAutocomplete.addClass("inactive");
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
		try	{
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition ((gps) => {
					this.position = {
						lat: gps.coords.latitude,
						lng: gps.coords.longitude
					};
					window.formMap.validateCountry(this.position).then(function(result) {
						if (result) {
							window.formMap.position = result;
							window.formMap.setCurrentPosition();
						}
					});
				});
			}
		} catch(error) {
			return window.formMap.position;
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

	setPosition() {
		this.validateCountry(this.locationAd).then(function(result) {
			window.formMap.position = result || window.formMap.googleMap.defaultLocation;
			window.formMap.configMap();
			if(!result) {
				window.formMap.geolocate();
			} else {
				window.formMap.setCurrentPosition();
			}
		});
	}
}

let initialize = () => {
	window.formMap = new FormMap();
	window.formMap.country = $(".form-map-component").data("google-map").country;
	// set the current location via data in node
	window.formMap.setPosition();
	window.googleRanges = googleRanges;
	window.googleMarker = googleMarker;
};

module.exports = {
	initialize
};
