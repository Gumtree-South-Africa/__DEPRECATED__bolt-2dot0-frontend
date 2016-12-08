'use strict';


let config = require('config');


module.exports = () => {

	return {
		'epsUploadExternalURL': config.get('eps.epsUploadExternalURL'),

		'epsToken': config.get('eps.epsToken'),

		'isEbayDirectUploadEnabled': config.get('eps.IsEbayDirectUL'),
		'googleMapKey': config.get('vmGoogleMapKeys') ? config.get('vmGoogleMapKeys')[Math.floor(Math.random() * 4)] : false,
	};
};
