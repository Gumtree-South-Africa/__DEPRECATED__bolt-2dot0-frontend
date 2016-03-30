"use strict";

/** 
 * @description A singleton that Handles StringUtils
 * @constructor
 */
var BOLT = BOLT || {};
BOLT.StringUtils = (function () {
	// Private methods
	var rot = function( t, u, v ) {
		return String.fromCharCode( ( ( t - u + v ) % ( v * 2 ) ) + u );
	};

	// Public methods
	return {

		rot13 : function(message) {
			var b = [], c, i = 0,
				a = "a".charCodeAt(), z = a + 26,
				A = "A".charCodeAt(), Z = A + 26;
			
			if (!message) {
				return "";
			}

			i = message.length;
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
			 return b.join("");
		},
		
		obfuscate	: function(message) {
			return this.rot13(message);
		},

		deobfuscate	: function(message) {
			return this.rot13(message);
		},

		getQuerystringFromParameterMap : function(parameterMap) {
		    var result = [];
		    for (var param in parameterMap)
		        result.push(encodeURIComponent(param) + "=" + encodeURIComponent(parameterMap[param]));

		    return result.join("&");
		}

	};
})();

// Aditional. We shoud refactor this:
String.prototype.format = String.prototype.f = function() {
    var s = this.substr(0),
        i = arguments.length;
    while (i--)
        s = s.split("{" + i + "}").join(arguments[i] !== null && typeof arguments[i] !== 'undefined' ? arguments[i] : "");
    return s;
};

(function() {
    // Fix for trim on IE<9
    if(typeof String.prototype.trim !== 'function') {
        String.prototype.trim = function() {
            return this.replace(/\s\s*$/, '');
        }
    }

    // Array indexOf, in case it is not present.
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function(obj, start) {
            for (var i = (start || 0), j = this.length; i < j; i++) {
                if (this[i] === obj) { return i; }
            }
            return -1;
        }
    }

}());



