'use strict';

let _bindEvents = () => {
	this.$priceInput.on('keydown', (e) => {
		if (e.keyCode > 57 || e.keyCode < 48) {
			switch (e.keyCode) {
				case 8://backspace
				case 9://tab
				case 13://delete
				case 37://left arrow
				case 39://right arrow
					break;
				default:
					e.preventDefault();
					break;
			}
		}
	});
};

let initialize = () => {
	  
	window.BOLT.trackEvents({"event": "PostAdOptionsModal", "p": {"t": "PostAdOptionsModal"} });   
	// update title input char count
	$('.title-input').on('keyup', (event) => {
		$('.char-count').text(event.target.value.length);
		
	});
	
	$('.title-input').on('click', () =>{
        window.BOLT.trackEvents({"event": " PostAdTitle"});
    });
	
	$('.price-input').on('click', () => {
		window.BOLT.trackEvents({"event": " PostAdPrice"});
	});
	
	
	$('.email-login-btn').on('click', () => {
		window.BOLT.trackEvents({"event": "PostAdLoginWithEmail", "p": {"t": "LoginBegin"} });   
	});
	
	$('.facebook-button').on('click', () => {
		window.BOLT.trackEvents({"event": "PostAdLoginWithFacebook", "p": {"t": "LoginBegin"} });   
	});
	
	$('.register-link').on('click', () => {
		window.BOLT.trackEvents({"event": "PostAdRegister", "p": {"t": "UserRegisterBegin"} });   
	});

	this.$priceInput = $('#price-input');
	_bindEvents();

};

module.exports = {
	initialize
};



