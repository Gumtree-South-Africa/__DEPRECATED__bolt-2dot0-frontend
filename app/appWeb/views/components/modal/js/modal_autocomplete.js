'use strict';

let initialize = () => {

	$(document).ready(() => {
		let locale = $('html').attr('data-locale');
		let country = locale.split('_')[1];
		let lang = locale.split('_')[0];
		let $loc = $('#modal-location');

		$('#modal-location').on('keyup', function() {
				let htmlElt = '';
						if ($(this).val() !== '') {
						$.ajax({

								//TODO: use proper google account key

								url: 'https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyB8Bl9yJHqPve3b9b4KdBo3ISqdlM8RDhs&components=country:' + country + '&language='+ lang + '&address=' + $('#modal-location').val(),
								dataType: 'JSON',
								type: 'GET',
								success: function(resp) {
										if (resp.results instanceof Array) {
												$('#autocompleteField').html('');
												if (resp.results.length > 0) {
														$('#autocompleteField').removeClass('hiddenElt');
														for (let idx = 0; idx < resp.results.length; idx++) {
																let address = resp.results[idx].formatted_address;
																let latitude = resp.results[idx].geometry.location.lat;
																let longitude = resp.results[idx].geometry.location.lng;
																let splitAddress = address.split(',');
																let partialAddy = (splitAddress.length <= 2) ? splitAddress[splitAddress.length-1] : (splitAddress[splitAddress.length-2] + splitAddress[splitAddress.length-1]);
																htmlElt += "<div class='ac-field' data-long=" + longitude + " data-lat=" + latitude + "><span class='suffix-addy hiddenElt'>" + partialAddy + "</span><span class='full-addy'>" + address + "</span></div>";
														}
														$('#autocompleteField').append(htmlElt);
												} else {
														$('#autocompleteField').addClass('hiddenElt');
												}
										}
								}
						});
					}
		});

		$('#autocompleteField').on('click', '.ac-field', function() {
				let $this = $(this);

				$('#autocompleteField').addClass('hiddenElt');
				$loc.val($this.find('.suffix-addy').html());
		});

		$(':not(#autocompleteField)').on('click', function() {
				$('#autocompleteField').addClass('hiddenElt');
		});

		$('.modal-closearea, .modal-cp .btn').on('click', function() {
				$('.modal-cp').addClass('hiddenElt');
		});

		$('.card-title-cp').on('click', function() {
				$('.modal-cp').removeClass('hiddenElt');
		});
	});
};


module.exports = {
	initialize
};
