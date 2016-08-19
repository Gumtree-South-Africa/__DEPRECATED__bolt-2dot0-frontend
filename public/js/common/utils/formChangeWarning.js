"use strict";
let initialize = () => {
	window.onbeforeunload = () => {
		return '';
	};
};

let disableFormWarning = () => {
	window.onbeforeunload = () => {};
};

module.exports = {
	initialize,
	disableFormWarning
};
