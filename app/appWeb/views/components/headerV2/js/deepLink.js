'use strict';

let initialize = () => {
	(function(b, r, a, n, c, h, _, s, d, k) {
		if (!b[n] || !b[n]._q) {
			for (; s < _.length;)c(h, _[s++]);
			d = r.createElement(a);
			d.async = 1;
			d.src = "https://cdn.branch.io/branch-latest.min.js";
			k = r.getElementsByTagName(a)[0];
			k.parentNode.insertBefore(d, k);
			b[n] = h;
		}
	})(window, document, "script", "branch", function(b, r) {
		b[r] = function() {
			b._q.push([r, arguments]);
		}
	}, {
		_q: [],
		_v: 1
	}, "addListener applyCode banner closeBanner creditHistory credits data deepview deepviewCta first getCode init link logout redeem referrals removeListener sendSMS setIdentity track validateCode".split(" "), 0);
	branch.init('key_live_ognT7X8BUKIBbFhWnhI5KlnhyxcKDuU4');
	branch.link({
		showiOS: true, // Should the banner be shown on iOS devices?
		showAndroid: true, // Should the banner be shown on Android devices?
		showDesktop: true,// Should the banner be shown on desktop devices?
		iframe: false,     // Show banner in an iframe, recommended to isolate Branch banner CSS
		disableHide: false,
		forgetHide: true,
		position: 'top', // Sets the position of the banner, options are: 'top' or 'bottom', and the default is 'top'
		mobileSticky: false, // Determines whether the mobile banner will be set `position: fixed;` (sticky) or `position: absolute;`, defaults to false *this property only applies when the banner position is 'top'
		desktopSticky: true, // Determines whether the desktop banner will be set `position: fixed;` (sticky) or `position: absolute;`, defaults to true *this property only applies when the banner position is 'top'
		make_new_link: false, // Should the banner create a new link, even if a link already exists?
		channel: "Mobile Breakpoint",
		data: {
			'$deeplink_path': 'home'
		}
	}, (err, link) => {
		if (!err) {
			$('#js-deeplink').attr('href', link);
		} else {
			console.error(err);
		}
	});
};

module.exports = {
	initialize
};
