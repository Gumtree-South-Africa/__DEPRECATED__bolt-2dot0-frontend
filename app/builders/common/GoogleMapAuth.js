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
	let keyConfig = config.get('vmGoogleMapKeys');
	if (keyConfig) {
		return {
			'googleMapKey': keyConfig[Math.floor(Math.random() * keyConfig.length)]
		};
	} else {
		return {
			'googleMapKey': false
		};
	}
};
