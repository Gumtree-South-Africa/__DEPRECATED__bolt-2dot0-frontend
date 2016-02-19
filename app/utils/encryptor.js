'use strict';

/** 
 * @description A Singleton that encrypts data
 */
var Encryptor = {
	hash : function (value) {
		var crypto = require('crypto');
		var cipher = crypto.createCipher('HmacSHA512', '867f6e6ba179');

		var encrypted = cipher.update(value, 'utf8', 'hex');
		encrypted += cipher.final('hex');
		console.log('$$$$$$$$$$$$$$$$$$$', encrypted);
		
		return encrypted;
	}
};

module.exports = Encryptor;