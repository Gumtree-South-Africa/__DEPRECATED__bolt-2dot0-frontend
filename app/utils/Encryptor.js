"use strict";

var crypto = require("crypto");

/** 
 * @description A Singleton that encrypts data
 */
var Encryptor = {
	hash : function (value) {
		var secret = "867f6e6ba179";
		var hash = crypto.createHmac("sha512", secret)
		                 .update(value)
		                 .digest("base64");
		return hash;
	},
	
	KDF: function(password, salt, iterations) {
	    var pwd = new Buffer(password,"utf-8");
	    var key = Buffer.concat([pwd, salt]);
	    var i;
	    for (i = 0; i < iterations; i+=1) {
	      key = crypto.createHash("md5").update(key).digest();
	    }
	    return key;
	},

	getKeyIV: function(password, salt, iterations) {
	    var key = this.KDF(password,salt,iterations);
	    var keybuf = new Buffer(key,"binary").slice(0,8);
	    var ivbuf = new Buffer(key,"binary").slice(8,16);

	    return [ keybuf, ivbuf ];
	},
	
	encrypt: function(payload) {
		var password = "867f6e6ba179";
		var salt = new Buffer("d99bce325735e303","hex");
		var iterations = 19;
		
	    var kiv = this.getKeyIV(password, salt, iterations);
	    var cipher = crypto.createCipheriv("des", kiv[0],kiv[1]);
	    var encrypted = [];
	    encrypted.push(cipher.update(payload,"utf-8","hex"));
	    encrypted.push(cipher.final("hex"));

	    return new Buffer(encrypted.join(""),"hex").toString("base64");
	},

	decrypt: function(payload) {
		var password = "867f6e6ba179";
		var salt = new Buffer("d99bce325735e303","hex");
		var iterations = 19;
		
	    var encryptedBuffer = new Buffer(payload,"base64");
	    var kiv = this.getKeyIV(password,salt,iterations);
	    var decipher = crypto.createDecipheriv("des", kiv[0],kiv[1]);
	    var decrypted = [];
	    decrypted.push(decipher.update(encryptedBuffer));
	    decrypted.push(decipher.final());
	    return decrypted.join("");
	}

};

module.exports = Encryptor;