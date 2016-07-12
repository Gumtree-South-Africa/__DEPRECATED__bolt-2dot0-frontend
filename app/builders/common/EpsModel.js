'use strict';


let config = require('config');


module.exports = () => {

	return {
		'epsUploadExternalURL': config.get('eps.epsUploadExternalURL'),

		'epsToken': config.get('eps.epsToken'),

		'isEbayDirectUploadEnabled': config.get('eps.IsEbayDirectUL')
	};
};
