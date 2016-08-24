'use strict';

let _toggleCategory = (e) => {

	$(e.currentTarget).find('.menu-items').toggleClass('hide');
	$(e.currentTarget).parents('.footer-inner-wrappper').toggleClass('expanded');

	if ($('.footer-links div:nth-child(4)').hasClass('expanded')) {
		if ($('.footer-links div:nth-child(5)').hasClass('expanded')) {
			$('.seo-links').css({'display': 'inline-block', 'top': '-21.2em'});
		} else {
			$('.seo-links').css({'display': 'inline-block', 'top': '-16.0em'});
		}
	} else {
		$('.seo-links').css('display', 'none');
	}

};

let initialize = () => {
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
