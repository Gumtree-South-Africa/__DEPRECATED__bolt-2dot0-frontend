'use strict';
let formChangeWarning = require("public/js/common/utils/formChangeWarning.js");
let spinnerModal = require('app/appWeb/views/components/spinnerModal/js/spinnerModal.js');

let _bindEvents = () => {
	this.$priceInput.on('keydown', (e) => {
		if ((e.keyCode > 57 || e.keyCode < 48)) {
			switch (e.keyCode) {
				case 8://backspace
				case 9://tab
				case 13://delete
				case 37://left arrow
				case 39://right arrow
				case 189: //negative
					break;
				default:
					e.preventDefault();
					break;
			}
		} else if (e.ctrlKey) {
			switch (e.keyCode) {
				case 65: //Ctrl-a
				case 67: // ctrl-c
				case 86: // ctrl-v
					break;
				default:
					e.preventDefault();
					break;
			}
		} else if (e.shiftKey) {
			//Prevent special characters (shift + number: !**@#%)
			e.preventDefault();
		}
	});
};


let initialize = () => {

	window.BOLT.trackEvents({"event": "PostAdForm", "p": {"t": "PostAdForm"} });
	// update title input char count
	$('.title-input').on('keyup', (event) => {
		$('.char-count').text(Number($(event.target).attr('maxlength')) - event.target.value.length);
	});

	$('.title-input').on('change', () => {
		window.BOLT.trackEvents({"event": "PostAdTitle"});
    });

	$('.price-input').on('change', () => {
		window.BOLT.trackEvents({"event": "PostAdPrice"});
	});

	$('.email-login-btn').on('click', () => {
		window.BOLT.trackEvents({"event": "LoginBegin", "p": {"t": "PostAdLoginWithEmail"}});
	});

	$('.facebook-button').on('click', () => {
		window.BOLT.trackEvents({"event": "LoginBegin", "p": {"t": "PostAdLoginWithFacebook"}});
	});

	$('.register-link').on('click', () => {
		window.BOLT.trackEvents({"event": "UserRegisterBegin", "p": {"t": "PostAdRegister"}});
	});

	formChangeWarning.initialize();
	spinnerModal.initialize();

	this.$priceInput = $('#price-input');
	_bindEvents();
};

module.exports = {
	initialize
};
