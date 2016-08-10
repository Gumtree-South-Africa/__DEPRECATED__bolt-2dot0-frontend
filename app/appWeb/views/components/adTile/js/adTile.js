'use strict';

let $ = require('jquery');
require("jquery-lazyload");

let initialize = () => {
	$(document).ready(() => {
		$("img.lazy").lazyload();

		$("img.lazy").on("appear", () => {
			console.log("appear");
		});
	});
};

module.exports = {
	initialize
};
