'use strict';

let initialize = () => {
	  
	window.BOLT.trackEvents({"event": "PostAdOptionsModal", "p": {"t": "PostAdOptionsModal"} });   
	// update title input char count
	$('.title-input').on('keyup', (event) => {
		$('.char-count').text(event.target.value.length);
	});
	
	$('.title-input').on('click change', () =>{
        window.BOLT.trackEvents({"event": " PostAdTitle"});
    });
	
	$('.price-input').on('click change', () => {
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
};

module.exports = {
	initialize
};



