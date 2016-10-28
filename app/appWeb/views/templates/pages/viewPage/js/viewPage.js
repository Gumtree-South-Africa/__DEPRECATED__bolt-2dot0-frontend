'use strict';

let viewPageGallery = require('app/appWeb/views/components/viewPageGallery/js/viewPageGallery.js');

//TODO: update this breakpoint
const MEDIUM_BREAKPOINT = 848;

let _slickOptions = {
	arrows: true,
	dots: true,
	infinite: false,
	responsive: [
		{
			breakpoint: MEDIUM_BREAKPOINT,
			settings: {
				arrows: false,
				slidesToShow: 1,
				slidesToScroll: 1
			}
		}
	],
	slidesToShow: 5,
	slidesToScroll: 1
};

let initialize = () => {
	viewPageGallery.initialize({
		slickOptions: _slickOptions,
		showImageTracking: true
	});
};

module.exports = {
	initialize
};
