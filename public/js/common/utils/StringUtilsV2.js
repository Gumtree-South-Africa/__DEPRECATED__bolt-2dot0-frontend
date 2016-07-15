"use strict";

let _rot = function(t, u, v) {
	return String.fromCharCode(((t - u + v) % (v * 2)) + u);
};

let StringUtilsV2 = {
	rot13: (message) => {
		var b = [], c, i = 0,
			a = "a".charCodeAt(), z = a + 26,
			A = "A".charCodeAt(), Z = A + 26;

		if (!message) {
			return "";
		}

		i = message.length;
		while (i--) {
			c = message.charCodeAt(i);
			if (c >= a && c < z) {
				b[i] = _rot(c, a, 13);
			}
			else if (c >= A && c < Z) {
				b[i] = _rot(c, A, 13);
			}
			else {
				b[i] = message.charAt(i);
			}
		}
		return b.join("");
	}
};

module.exports = StringUtilsV2;
