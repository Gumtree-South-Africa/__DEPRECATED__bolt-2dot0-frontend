'use strict';
require('../_isotopePrototype.scss');
let Isotope = require('isotope-layout');

$(document).ready(() => {
	var iso = new Isotope($('.isotope-container')[0], {
		itemSelector: '.isotope-item',
		layoutMode: 'masonry',
		masonry: {
			columnWidth: 75
		}
	});
});
