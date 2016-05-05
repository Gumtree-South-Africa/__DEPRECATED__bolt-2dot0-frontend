// jshint ignore: start

/**
 * @description This module handles the rendering of a Map that can be used to select a predefined location (state/region)
 *     to enhance user interaction in making such selection.
 * @namespace  BOLT
 * @class Map
 * @author Ulises Robles (uroblesmellin@)
 */

var BOLT = BOLT || {};
var google = google || {};

BOLT.MapLatLong = (function () {
		var DEFAULT_LAT =   37.38291179923258;
		var DEFAULT_LONG =  -121.92613005638123;
        var ecgOfficeLoc = { lat : DEFAULT_LAT, long : DEFAULT_LONG };

        var geocoder = new google.maps.Geocoder();
        var dataLatLong = {
                	lat: 0,
                	long: 0
        };
        var addressStr = "";

        function initialize() {
            var loc = {};
            var geo;
            var browserSupportFlag;

            if (google.loader.ClientLocation) {
                loc.lat = google.loader.ClientLocation.latitude;
                loc.lng = google.loader.ClientLocation.longitude;
                renderMapWithCoords(loc.lat, loc.lng);
            } else if (navigator.geolocation) {
                // Try HTML5 geolocation
                navigator.geolocation.getCurrentPosition(function(position) {
                    renderMapWithCoords(position.coords.latitude, position.coords.longitude);
                }, function() {
                    handleNoGeolocation(true);
                });
            } else if (google.gears) {
                 // Browser doesn't support Geolocation
                browserSupportFlag = true;
                geo = google.gears.factory.create("beta.geolocation");
                geo.getCurrentPosition(function(position) {
                    renderMapWithCoords(position.latitude,position.longitude);
                }, function() {
                    handleNoGeoLocation(browserSupportFlag);
                });
            } else {
                browserSupportFlag = false;
                handleNoGeolocation(browserSupportFlag);
            }
         }

        function setPositionAddress(pos, infowinObj) {
             geocoder.geocode({
                 latLng: pos
             }, function (responses) {
                 if (responses && responses.length > 0) {
                     if ( (typeof $('#Location').val() !== 'undefined') && ($('#Location').val() == '')) {
                         infowinObj.posAddress = responses[0].formatted_address;
                         $('#Location').val(infowinObj.posAddress);
                         $('#latitude').val(pos.lat());
                         $('#longitude').val(pos.lng());
                         $('#address').val(infowinObj.posAddress);
                         $('#geolatitude').val(pos.lat());
                         $('#geolongitude').val(pos.lng());
                         $('#geoaddress').val(infowinObj.posAddress);
                     }
                     $('#maps-link').removeClass("hiddenElt");
                 } else {
                     infowinObj.posAddress = "";
                 }
             });
        }

        function setInfoWindowContent(latLng, infowinObj) {
            var content = "";
            var coordsStr = "Coords: (" + latLng.lat().toFixed(5) + "," + latLng.lng().toFixed(5) + ")";

            setPositionAddress(latLng, infowinObj);

            window.setTimeout(function () {
            	/*
                content =  "<div class='map_bg_logo'><span style='color:#1270a2;'><b>" + infowinObj.posAddress + "</b></span>" +
                         "<div style='border-top:1px dotted #ccc; height:1px;  margin:5px 0;'></div>" +
                         "<span style='color:#555;font-size:11px;'><b>" + coordsStr + "</b></div>";
                         */

                content =  "<div class='map_bg_logo'><span style='color:#1270a2;'><b><span id='infowin-address'>" + infowinObj.posAddress + "</span></b></div>";

				addressStr = infowinObj.posAddress;

                infowinObj.setContent(content);
            }, 300);
        }

        function handleNoGeolocation(errorFlag) {
            if (errorFlag === true) {
                console.log("Geolocation service failed.");
            } else {
                console.log("Your browser doesn't support geolocation.");
            }

            // renderMapWithCoords(ecgOfficeLoc.lat, ecgOfficeLoc.long);
        }

        function renderMapWithCoords(lat, long) {
            var map, marker, infowindow;
            var myLatlng =  new google.maps.LatLng(lat, long);
            var myOptions = {
              zoom: 17,
              center: myLatlng //,
              //   mapTypeId: google.maps.MapTypeId.SATELLITE
              //  mapTypeId: google.maps.MapTypeId.TERRAIN
            };

            dataLatLong = {
            	lat: parseFloat(lat.toFixed(5)),
              	long: parseFloat(long.toFixed(5))
            };

            // Map creation
            map = new google.maps.Map(document.getElementById("map_canvas"),
                myOptions);

            // Marker definition
            marker = new google.maps.Marker({
                position: myLatlng,
                title: "Click to view info!",
                map: map,
                draggable: true
            });
            marker.setMap(map);

            // Add circle overlay and bind to marker
            var circle = new google.maps.Circle({
                map: map,
                radius: 3200,    // 10 miles in metres
                fillColor: '#2FF1F4'
            });
            circle.bindTo('center', marker, 'position');

            // Info contextual window for marker
            infowindow = new google.maps.InfoWindow({
                content: "<div class='map_bg_logo'><span style='color:#555;font-size:11px;'><b></b></div>" });

            setInfoWindowContent(marker.getPosition(), infowindow);

            // Click event listener for the marker
            google.maps.event.addListener(marker, "click", function() {
                infowindow.open(map, marker);
            });


            // Click event listener for the map itself
            google.maps.event.addListener(map, "click", function (e) {
                // lat and lng is available in e object
                var latLng = e.latLng;

                dataLatLong = {
                	lat: parseFloat(latLng.lat().toFixed(5)),
                	long: parseFloat(latLng.lng().toFixed(5))
                };

                marker.setPosition(latLng);

                setInfoWindowContent(latLng, infowindow);

				dataLatLong.address = addressStr || "";
                $(document).trigger("applyLocation", [dataLatLong]);


                // setPositionAddress(latLng, infowindow);
                //infowindow.setContent("Coords: (" + latLng.lat() + "," + latLng.lng() + ")");
            });
        }

		google.maps.event.addDomListener(window, "load", initialize);

        return {
			getLatLong : function () {
				dataLatLong.address = addressStr || "";
				return dataLatLong;
			}
		};

})();

