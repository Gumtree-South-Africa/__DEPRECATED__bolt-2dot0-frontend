'use strict';

let $ = require('jquery');

let initialize = () => {

	let _toggleCategory = (e) => {

		$(e.currentTarget).find('.menu-items').toggleClass('hide');
		$(e.currentTarget).parents('.footer-inner-wrappper').toggleClass('expanded');

		if ($('.footer-links div:nth-child(5)').hasClass('expanded')) {
			 if ($('.footer-links div:nth-child(7)').hasClass('expanded')) {
				 $('.seo-links').css({'display': 'inline-block', 'top': '-20.3em'});
			 } else {
				 $('.seo-links').css({'display': 'inline-block', 'top': '-15em'});
			 }
		} else {
           $('.seo-links').css('display', 'none');
		}

	};

	$(document).ready(() => {
		$('.menu-items').addClass('hide');
		$('.footer-inner-wrappper').removeClass('inner');
		$('.menu-category').on('click', (e) => {
			_toggleCategory(e);

		});

	});
};

module.exports = {
	initialize
};
