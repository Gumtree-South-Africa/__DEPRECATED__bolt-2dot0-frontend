'use strict';

let initialize = () => {

		$(document).ready(() => {
			function initMap() {
				let mapDiv = document.getElementById('map');
				let data =  $.parseJSON($('#nowselling .hiddenElt').html());
				let map = new google.maps.Map(mapDiv, {
					center: {
						lat: 19.414980,
						lng: -99.177446
					},
					zoom: 13,
					disableDefaultUI: false
				});

				let markers = [];
				let dataImages = []

				//for (let i = 0; i < data.ads.length; i++) {
				//	let latLng = new google.maps.LatLng(data.ads[i].geoLocation.lat, data.ads[i].geoLocation.lng);
				//
				//	dataImages.push(data.ads[i].pictures[0].sizeUrls[0].NORMAL);
				//	let markerImage = new google.maps.MarkerImage(data.ads[i].pictures[0].sizeUrls[0].NORMAL, new google.maps.Size(24, 32));
				//
				//	let marker = new google.maps.Marker({
				//		'position': latLng,
				//		'draggable': true,
				//		'icon': markerImage
				//	});
				//	markers.push(marker);
				//}
				for (let i = 0; i < data.facet.length; i++) {
					let facetObj = data.facet[i];
					let lat = facetObj.value;
					for (let j = 0; j < facetObj.pivot.length; j++) {
						let pivotObj = facetObj.pivot[j];
						let lng = pivotObj.value;

						let latLng = new google.maps.LatLng(lat, lng);

						dataImages.push('https://img.classistatic.com/crop/200x150/i.ebayimg.com/00/s/NjAwWDgwMA==/z/Yf8AAOSwXSJXO8Cy/$_19.JPG?set_id=8800005007');
						let markerImage = new google.maps.MarkerImage('https://img.classistatic.com/crop/200x150/i.ebayimg.com/00/s/NjAwWDgwMA==/z/Yf8AAOSwXSJXO8Cy/$_19.JPG?set_id=8800005007', new google.maps.Size(10, 12));

						let marker = new google.maps.Marker({
							'position': latLng,
							'draggable': true,
							'icon': markerImage
						});
						markers.push(marker);
					}
				}

				let mcOptions = {
					gridSize: 50,
					maxZoom: 30,
					imagePath: dataImages
				};
				let mc = new MarkerClusterer(map, markers, mcOptions);

			}
			initMap();
		});

};

module.exports = {
	initialize
};
