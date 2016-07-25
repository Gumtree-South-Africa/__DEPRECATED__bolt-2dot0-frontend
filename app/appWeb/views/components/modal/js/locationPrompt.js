'use strict';

let initialize = () => {

	$(document).ready(() => {

		function geoShowMyLocation(geoCookieValue) {
			geoCookieValue = geoCookieValue.replace('ng',',');

			$.ajax({
				url: 'https://maps.google.com/maps/api/geocode/json?latlng=' + geoCookieValue + '&sensor=false',
				dataType: 'JSON',
				type: 'GET',
				success: function(resp) {
					$('#modal-location').removeClass('spinner').attr('disabled', false);
					if (resp.results instanceof Array) {
						if(resp.results.length > 1) {
							$('.search-textbox-container .location-text').html(resp.results[resp.results.length-2].address_components[0].long_name);
							$('#modal-location').val(resp.results[resp.results.length-2].address_components[0].long_name);
						} else {
							$('.search-textbox-container .location-text').html(resp.results[resp.results.length-1].address_components[0].long_name);
							$('#modal-location').val(resp.results[resp.results.length-1].address_components[0].long_name);
						}
					}
				}
			});
		}

		function geoFindMe() {

			if (!navigator.geolocation) {
				console.error('Geolocation is not supported by your browser');
				return;
			}

			function success(position) {
				let latitude  = position.coords.latitude;
				let longitude = position.coords.longitude;

				document.cookie = 'geoId' + "=" + escape(latitude + 'ng' + longitude) + ";path=/";
				geoShowMyLocation(escape(latitude + 'ng' + longitude));

			}

			function error() {
				console.error('Unable to retrieve your location');
			}

			navigator.geolocation.getCurrentPosition(success, error);
		}

		function getCookie(cname) {
			let name = cname + "=";
			let ca = document.cookie.split(';');
			for(let i = 0; i <ca.length; i++) {
				let c = ca[i];
				while (c.charAt(0)===' ') {
					c = c.substring(1);
				}
				if (c.indexOf(name) === 0) {
					return c.substring(name.length,c.length);
				}
			}
			return "";
		}


		//click on gps icon
		$('.modal-cp .icon-location-v2').on('click', function() {
			$('#modal-location').addClass('spinner').attr('disabled', true);
			geoFindMe();
		});

		//click on Continue button
		$('.modal-cp .btn').on('click', function() {
			window.location.reload(true);
		});

		//on Initialize
		geoShowMyLocation(getCookie('geoId'));

	});
};


module.exports = {
	initialize
};
