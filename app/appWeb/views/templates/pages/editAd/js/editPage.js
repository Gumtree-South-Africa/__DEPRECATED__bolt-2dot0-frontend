"use strict";

let photoCarousel = require('app/appWeb/views/components/photoCarousel/js/photoCarousel.js');

//TODO: update this breakpoint
const MEDIUM_BREAKPOINT = 848;


let _slickOptions = {
	arrows: true,
	infinite: false,
	responsive: [
		{
			breakpoint: MEDIUM_BREAKPOINT,
			settings: {
				slidesToShow: 2,
				slidesToScroll: 2
			}
		}
	],
	slidesToShow: 4,
	slidesToScroll: 4
};

let initialize = () => {
	//TODO: this might be updated to imageUrls
	let initialImages = JSON.parse($('#image-urls').text() || '{sizeUrls: []}').sizeUrls;
	photoCarousel.initialize({
		slickOptions: _slickOptions,
		showDeleteImageIcons: true,
		initialImages: initialImages
	});
};

module.exports = {
	initialize
};
