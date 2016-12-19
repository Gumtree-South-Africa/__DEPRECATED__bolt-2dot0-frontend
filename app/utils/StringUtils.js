'use strict';

var stripComments = require('strip-comment');

/**
 * @description A singleton that Handles StringUtils
 * @constructor
 */
var StringUtils = (function() {
	var rot13 = function(message) {
		var b = [], c, i = 0, a = 'a'.charCodeAt(), z = a + 26, A = 'A'.charCodeAt(), Z = A + 26;

		if (message && message.length) {
			i = message.length;
		}
		while (i--) {
			c = message.charCodeAt(i);
			if (c >= a && c < z) {
				b[i] = rot(c, a, 13);
			} else if (c >= A && c < Z) {
				b[i] = rot(c, A, 13);
			} else {
				b[i] = message.charAt(i);
			}
		}
		return b.join('');
	};

	var rot = function(t, u, v) {
		return String.fromCharCode(((t - u + v) % (v * 2)) + u);
	};

	return {
		obfuscate: function(message) {
			return rot13(message);
		}, deobfuscate: function(message) {
			return rot13(message);
		}, unescapeHtml: function(html) {
			return String(html)
				.replace(/&quot;/g, '"')
				.replace(/&#39;/g, '\'')
				.replace(/&lt;/g, '<')
				.replace(/&gt;/g, '>')
				.replace(/&amp;/g, '&')
				.replace(/&nbsp;/g, ' ');
		}, fixNewline: function(html) {
			return String(html)
				.replace(/(\r\n|\r|\n)/g, '\r');
		}, unescapeUrl: function(html) {
			var urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
			return String(html)
				.replace(urlRegex, '');
		}, unescapeEmail: function(html) {
			var emailRegex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[A-Z]{2}|com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|museum)\b/ig;
			return String(html)
				.replace(emailRegex, 'XXX');
		}, stripCommentJs: function(text) {
			return stripComments.js(text, false);
		}, stripCommentCss: function(text) {
			return stripComments.css(text, false);
		}, stripCommentHtml: function(text) {
			return stripComments.html(text, false);
		}, stripComments: function(text) {
			return stripComments(text, false);
		},
		formatDate: function(date) {
			if (date) {
				let month = date.monthOfYear.toString();
				let day = date.dayOfMonth.toString();

				if (month.length === 1) {
					month = "0" + month;
				}

				if (day.length === 1) {
					day = "0" + day;
				}
				return `${date.year}-${month}-${day}`;
			} else {
				return null;
			}
		}
	};
})();

module.exports = StringUtils;
