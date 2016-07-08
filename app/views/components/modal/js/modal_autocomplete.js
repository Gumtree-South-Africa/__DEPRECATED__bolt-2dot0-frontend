'use strict';

let initialize = () => {

	$(document).ready(() => {
		let locale = $('html').attr('data-locale');
		console.log('loc: ',locale.split('_'));
		let country = locale.split('_')[1];
		let lang = locale.split('_')[0];
		$('#modal-location').on('keyup', function(){
				let htmlElt = '';
						if ($(this).val() != ''){
						$.ajax({
								url: 'https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyB8Bl9yJHqPve3b9b4KdBo3ISqdlM8RDhs&components=country:' + country + '&language='+ lang + '&address=' + $('#modal-location').val(),
								dataType: 'JSON',
								type: 'GET',
								success: function(resp){
										if (resp.results instanceof Array) {
												$('#autocompleteField').html('');
												if (resp.results.length > 0) {
														$('#autocompleteField').removeClass('hiddenElt');
														for (let idx = 0; idx < resp.results.length; idx++) {
																let address = resp.results[idx].formatted_address;
																let latitude = resp.results[idx].geometry.location.lat;
																let longitude = resp.results[idx].geometry.location.lng;
																let addyLength = resp.results[idx].address_components.length;
																let split_address = address.split(',');
																let address_to_display = split_address[split_address.length-2] + split_address[split_address.length-1];
																console.log('addy: ',address_to_display);
																htmlElt += '<div class="ac-field" data-addytodisplay=' + address_to_display + ' data-long=' + longitude + ' data-lat=' + latitude + '>' + address + '</div>';
														}
														$('#autocompleteField').append(htmlElt);
												}
												else {
														$('#autocompleteField').addClass('hiddenElt');
												}
										}
								}
						})
					}
		})

		$('#autocompleteField').on('click', '.ac-field', function(){
				let $this = $(this);
				$('#autocompleteField').addClass('hiddenElt');
				$('#modal-location').val($this.attr('data-addytodisplay'));
		});

		$(':not(#autocompleteField)').on('click', function(e){
				$('#autocompleteField').addClass('hiddenElt');
		});

		$('.modal-closearea, .modal-cp .btn').on('click', function(e){
				$('.modal-cp').addClass('hiddenElt');
		})

		$('.card-title-cp').on('click', function(e){
				$('.modal-cp').removeClass('hiddenElt');
		})
	})
};

initialize();
