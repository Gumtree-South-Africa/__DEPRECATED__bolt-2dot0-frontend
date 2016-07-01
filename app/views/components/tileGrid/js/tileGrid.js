'use strict';

// http://isotope.metafizzy.co/extras.html#browserify
let $ = require('jquery');
let bridget = require('jquery-bridget');
let Isotope = require('isotope-layout');


let initialize = () => {
	// Isotope requres document to be ready activated
	$(document).ready(() => {

		$.bridget('isotope', Isotope);	// after this you can use $().isotope()

		$('.use-isotope-handler').addClass("using-isotope");	// tag so we get configured sizes

		$('.use-isotope-handler').isotope({
			itemSelector: '.tile-item',
			layoutMode: 'masonry',
			masonry: {
				columnWidth: '.column-sizer',
				gutter: '.gutter-sizer-horizontal',
				isFitWidth: true
			}
		});
	});
};

module.exports = {
	initialize
};

