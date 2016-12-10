/*
*
*  Currently this module is just for internal VM testing where we are using Google Keys auth instead of Google Client ID
*  , With ClientID we can only call google map api in external urls like PROD, Stagging and LNP, but for VM TESTING we need
*  another way, that's why this google KEY works.
*
 */
'use strict';


let config = require('config');


module.exports = () => {
	if (config.get('vmGoogleMapKeys')) {
		return {
			'googleMapKey': config.get('vmGoogleMapKeys')[Math.floor(Math.random() * 7)]
		};
	} else {
		return {
			'googleMapKey': false
		};
	}
};
