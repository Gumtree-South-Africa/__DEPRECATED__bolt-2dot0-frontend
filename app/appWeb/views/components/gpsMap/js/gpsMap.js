'use strict';

let initialize = () => {

		$(document).ready(() => {
			function initMap() {
				let mapDiv = document.getElementById('map');
				let data = $('#map').attr('data-map');
				console.log('mapData: ', data);
				let map = new google.maps.Map(mapDiv, {
					center: {
						lat: 19.414980,
						lng: -99.177446
					},
					zoom: 14,
					disableDefaultUI: true
				});

				let markers = [];
				for (let i = 0; i < data.length; i++) {
					console.log(data[i]);
					let latLng = new google.maps.LatLng(data[i].geoLocation.lat, data[i].geoLocation.lng);
					let markerImage = new google.maps.MarkerImage(data[i].pictures[0].sizeUrls[0].NORMAL, new google.maps.Size(24, 32));
					let marker = new google.maps.Marker({
						'position': latLng,
						'draggable': true,
						'icon': markerImage
					});
					markers.push(marker);
				}

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
