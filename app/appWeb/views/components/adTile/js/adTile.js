'use strict';

let $ = require('jquery');
require("jquery-lazyload");

let initialize = () => {
	$(document).ready(() => {
		$("img.lazy").lazyload();

	});
};

module.exports = {
	initialize
};
