'use strict';

let $ = require('jquery');
require("jquery-lazyload");

let initialize = () => {
	$(document).ready(() => {
		$("img.lazy").lazyload({
			"skip_invisible": true
		});

		$("img.lazy").on("appear", () => {
			console.log("appear");
		});
	});
};

module.exports = {
	initialize
};
