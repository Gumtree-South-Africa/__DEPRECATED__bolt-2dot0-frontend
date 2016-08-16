"use strict";
let initialize = () => {
	window.onbeforeunload = () => {
		return '';
	};
};

module.exports = {
	initialize
};
