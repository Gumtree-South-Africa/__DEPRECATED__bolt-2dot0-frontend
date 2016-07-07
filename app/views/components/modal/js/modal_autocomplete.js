'use strict';

// let myDependency = require("../path/to/dependency");

//let $ = require('jquery');

let initialize = () => {
	// your setup code here
	$(document).ready(() => {
		$('#modal-location').on('keyup', function(){
				var htmlElt = '';
						if ($(this).val() != ''){
						$.ajax({
								url: 'https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyB8Bl9yJHqPve3b9b4KdBo3ISqdlM8RDhs&components=country:MX&language=es&address=' + $('#modal-location').val(),
								dataType: 'JSON',
								type: 'GET',
								success: function(resp){
										if (resp.results instanceof Array) {
												$('#autocompleteField').html('');
												if (resp.results.length > 0) {
														$('#autocompleteField').removeClass('hiddenElt');
														for (var idx = 0; idx < resp.results.length; idx++) {
																var address = resp.results[idx].formatted_address;
																var latitude = resp.results[idx].geometry.location.lat;
																var longitude = resp.results[idx].geometry.location.lng;
																var addyLength = resp.results[idx].address_components.length;
																var address_to_display = '';

																if(resp.results[idx].address_components.length < 5){
																	address_to_display = resp.results[idx].address_components[addyLength-1].long_name;
																}
																// else {
																// 	address_to_display = resp.results[idx].address_components[addyLength-1].long_name;
																// }
																//var address_to_display = resp.results[idx].address_components[addyLength-1].long_name;
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
				var $this = $(this);
				$('#autocompleteField').addClass('hiddenElt');
				$('#modal-location').val($this.attr('data-addytodisplay'));
				// $('#longitude').val($this.attr('data-long'));
				// $('#latitude').val($this.attr('data-lat'));
				// $('#address').val($this.html());
				// $('#Location').val($this.html());
		});

		$(':not(#autocompleteField)').on('click', function(e){
				$('#autocompleteField').addClass('hiddenElt');
		});

		$('.modal-closearea').on('click', function(e){
				$('.modal-cp').addClass('hiddenElt');
		})

		$('.card-title-cp').on('click', function(e){
				$('.modal-cp').removeClass('hiddenElt');
		})
	})
};

initialize();



//let $ = require('jquery');



// let initialize = () => {
// 	// Isotope requres document to be ready activated
// 	$(document).ready(() => {
//
// 		$.bridget('isotope', Isotope);	// after this you can use $().isotope()
//
// 		$('.use-isotope-handler').addClass("using-isotope");	// tag so we get configured sizes
//
// 		$('.use-isotope-handler').isotope({
// 			itemSelector: '.tile-item',
// 			layoutMode: 'masonry',
// 			masonry: {
// 				columnWidth: '.column-sizer',
// 				gutter: '.gutter-sizer-horizontal',
// 				isFitWidth: true
// 			}
// 		});
// 	});
// };
//
// module.exports = {
// 	initialize
// };
