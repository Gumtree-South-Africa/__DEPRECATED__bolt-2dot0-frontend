'use strict';

var crypto = require('crypto');

/** 
 * @description A Singleton that encrypts data
 */
var Encryptor = {
	hash : function (value) {
		var secret = '867f6e6ba179';
		var hash = crypto.createHmac('sha512', secret)
		                 .update(value)
		                 .digest('base64');
		console.log('$$$$$$$$', hash);
		return hash;
	},
	
	KDF: function(password,salt,iterations) {
	    var pwd = new Buffer(password,'utf-8');
	    var key = Buffer.concat([pwd, salt]);
	    var i;
	    for (i = 0; i < iterations; i+=1) {
	      key = crypto.createHash("md5").update(key).digest();
	    }
	    return key;
	},

	getKeyIV: function(password,salt,iterations) {
	    var key = KDF(password,salt,iterations);
	    var keybuf = new Buffer(key,'binary').slice(0,8);
	    var ivbuf = new Buffer(key,'binary').slice(8,16);
	    return [ keybuf, ivbuf ];
	},
	
	encrypt: function(value) {
		var secret = '867f6e6ba179';
	    var salt = new Buffer('0','hex');
		var iterations = 19;
		
	    var kiv = getKeyIV(secret,salt,iterations);
	    var cipher = crypto.createCipheriv('des', kiv[0],kiv[1]);
	    var encrypted = [];
	    encrypted.push(cipher.update(value,'utf-8','hex'));
	    encrypted.push(cipher.final('hex'));
	    return cb(undefined,new Buffer(encrypted.join(''),'hex').toString('base64'));
	}
};

module.exports = Encryptor;