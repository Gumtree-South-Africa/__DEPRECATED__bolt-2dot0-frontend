'use strict';

/** 
 * @description A singleton that Handles StringUtils
 * @constructor
 */
var StringUtils = (function () {
	var rot13 = function(message) {
		var b = [], c, i=0,
			a = 'a'.charCodeAt(), z = a + 26,
			A = 'A'.charCodeAt(), Z = A + 26;
		
		 if (message && message.length) {
			 i = message.length;
		 }
		 while(i--) {
			 c = message.charCodeAt( i );
			 if( c>=a && c<z ) { 
				 b[i] = rot( c, a, 13 ); 
			 }
			 else if( c>=A && c<Z ) { 
				 b[i] = rot( c, A, 13 ); 
			 }
			 else { 
				 b[i] = message.charAt( i ); 
			 }
		 }
		 return b.join( '' );
	};
	
	var rot = function( t, u, v ) {
		return String.fromCharCode( ( ( t - u + v ) % ( v * 2 ) ) + u );
	};
	
	return {
		obfuscate	: function(message) {
			return rot13(message);
		}, 
		deobfuscate	: function(message) {
			return rot13(message);
		}
	};
})();

module.exports = StringUtils;

