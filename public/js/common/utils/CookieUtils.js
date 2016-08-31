let CookieUtils = {
	/*
	 * @params
	 * 	cname - cookie name
	 * 	cvalue - cookie value
	 *	exdays - # of days until cookie expires (0 for session cookie)
	 */
	setCookie: (cname, cvalue, exdays) => {
		let d = new Date();
		d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
		let expires = "expires=" + d.toUTCString();
		document.cookie = cname + "=" + cvalue + "; " + expires;
	},

	getCookie: (cname) => {
		let name = cname + "=";
		let ca = document.cookie.split(';');
		for (let i = 0; i < ca.length; i++) {
			let c = ca[i];
			while (c.charAt(0) == ' ') {
				c = c.substring(1);
			}
			if (c.indexOf(name) == 0) {
				return c.substring(name.length, c.length);
			}
		}
		return "";
	}

};

module.exports = CookieUtils;
