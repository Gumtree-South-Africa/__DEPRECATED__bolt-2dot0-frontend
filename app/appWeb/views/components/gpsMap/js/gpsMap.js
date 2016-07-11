'use strict';

let initialize = () => {

		$(document).ready(() => {
			function initMap() {
				let mapDiv = document.getElementById('map');
				let mapData = $('#map').attr('data-map');
				console.log('mapData: ',mapData);
				let map = new google.maps.Map(mapDiv, {
					center: {
						lat: 19.414980,
						lng: -99.177446
					},
					zoom: 14,
					disableDefaultUI: true
				});

				let markers = [];
				/*
				for (let i = 0; i < data.length; i++) {
					let latLng = new google.maps.LatLng(data.photos[i].latitude, data.photos[i].longitude);
					let markerImage = new google.maps.MarkerImage(data.photos[i].imageUrl, new google.maps.Size(24, 32));
					let marker = new google.maps.Marker({
						'position': latLng,
						'draggable': true,
						'icon': markerImage
					});
					markers.push(marker);
				}
				*/

				let mcOptions = {
					gridSize: 50,
					maxZoom: 15,
					imagePath: 'images/m'
				};
				let mc = new MarkerClusterer(map, markers, mcOptions);

			}
			initMap();
		});

};

module.exports = {
	initialize
};
