'use strict';

// http://isotope.metafizzy.co/extras.html#browserify
let $ = require('jquery');
let Isotope = require('isotope-layout');
require('jquery-bridget');

let initialize = () => {
	// Isotope requres document to be ready activated
	$(document).ready(() => {
		
		this.$tileGrid = $(".use-isotope-handler");

		$.bridget('isotope', Isotope);	// after this you can use $().isotope()

		this.$tileGrid.addClass("using-isotope").removeClass("no-js");	// tag so we get configured sizes

		this.$tileGrid.isotope({
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

