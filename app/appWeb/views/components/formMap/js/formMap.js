'use strict';

let googleRanges = [];
let googleMarker = [];

class FormMap {
	constructor() {
		this.HtmlMap = $("#map");
		this.HtmlAutocomplete = $("#autocompleteTextBox");
		this.errorMessageMap = $(".errorMessageMap");
		this.HtmlSwitchRangeMarker = $("#switchRangeMarker");
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
		this.typeMark = this.HtmlSwitchRangeMarker[0].checked;
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

	// setup first configuration of google maps plugin
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
		this.map.addListener('dragend', () => {
			this.setMark();
		});
	}

	// function enables autocomplete
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
				this.setMark();
			}
		});
	}

	// function set position on map from place selected on autocomplete search
	expandViewportToFitPlace(map, place) {
		if (place.geometry.viewport) {
			map.fitBounds(place.geometry.viewport);
			map.setZoom(this.zoom);
		} else {
			map.setCenter(place.geometry.location);
			map.setZoom(this.zoom);
		}
	}

	// get coords of current position of map
	getPosition() {
		let cords = this.map.getCenter();
		let pos = {
			lat: cords.lat(),
			lng: cords.lng()
		};
		return pos;
	}

	// ser the current position of user
	setCurrentPosition() {
		let latLng = new google.maps.LatLng(this.position.lat, this.position.lng);
		this.map.setCenter(latLng);
		this.map.setZoom(this.zoom);
		this.setMark();
		this.HtmlAutocomplete.val();
	}

	// enable gps of current user vis HTML5
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

	// add range in map 
	_addRange(meters) {
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

	// remove all ranges in map
	_removeAllRanges() {
		for (let i = 0; i < googleRanges.length; i++) {
			googleRanges[i].setMap(null);
		}
		googleRanges = new Array();
	}

	// add marker in map
	_addMarker() {
		let center = this.map.getCenter();
		let tempMarker = new google.maps.Marker({
			position: center,
			icon: this.icons.fakeAd
		});
		tempMarker.setMap(this.map);
		googleMarker.push(tempMarker);
	}

	// remove all markers in map
	_removeAllMarker() {
		for (let i = 0; i < googleMarker.length; i++) {
			googleMarker[i].setMap(null);
		}
		googleMarker = new Array();
	}

	// validate and set position into map
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

	// uses proximity location or precise location 
	setMark() {
		this._removeAllMarker();
		this._removeAllRanges();
		this.typeMark= this.HtmlSwitchRangeMarker.is(":checked");
		if(this.typeMark) {
			// if is true set a marker in map (use precise location)
			this._addMarker();
		} else {
			// if is false set a range (use aproximate location)
			this._addRange(this.meters);
		}
	}
}

let initialize = () => {
	window.formMap = new FormMap();
	window.formMap.country = $(".form-map-component").data("google-map").country;
	// set the current location via data in node
	window.formMap.setPosition();
	window.googleRanges = googleRanges;
	window.googleMarker = googleMarker;

	// Events setup
	$('#switchRangeMarker').change(function() {
		if(window.formMap.position) {
			window.formMap.setMark();	
		}
    });
};

module.exports = {
	initialize
};
