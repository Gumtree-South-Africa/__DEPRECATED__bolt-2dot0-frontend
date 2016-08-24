"use strict";

class FormChangeWarning {
	initialize() {
		this.enable();
	};

	enable() {
		window.onbeforeunload = () => {
			return '';
		}
	}

	disable() {
		window.onbeforeunload = () => {};
	}
}

//singleton
module.exports = new FormChangeWarning();
