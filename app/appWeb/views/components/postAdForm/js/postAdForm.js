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
	  
	window.BOLT.trackEvents({"event": "LoginBegin", "p": {"t": "PostAdOptionsModal"} });   
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
		window.BOLT.trackEvents({"event": "LoginBegin", "p": {"t": "PostAdLoginWithEmail"} });   
	});
	
	$('.facebook-button').on('click', () => {
		window.BOLT.trackEvents({"event": "LoginBegin", "p": {"t": "PostAdLoginWithFacebook"} });   
	});
	
	$('.register-link').on('click', () => {
		window.BOLT.trackEvents({"event": "UserRegisterBegin", "p": {"t": "PostAdRegister"} });   
	});

	this.$priceInput = $('#price-input');
	_bindEvents();

};

module.exports = {
	initialize
};



