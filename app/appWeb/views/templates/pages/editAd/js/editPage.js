"use strict";

let photoCarousel = require('app/appWeb/views/components/photoCarousel/js/photoCarousel.js');

let initialize = () => {

	photoCarousel.initialize({
		slickOptions: {
			arrows: true,
			infinite: false,
			responsive: [
				{
					//TODO: update this breakpoint
					breakpoint: 848,
					settings: {
						slidesToShow: 2,
						slidesToScroll: 2
					}
				}
			],
			slidesToShow: 4,
			slidesToScroll: 4
		},
		showDeleteImageIcons: true
	});
};

module.exports = {
	initialize
};
