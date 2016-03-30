/* Load this script using conditional IE comments if you need to support IE 7 and IE 6. */

window.onload = function() {
	function addIcon(el, entity) {
		var html = el.innerHTML;
		el.innerHTML = '<span style="font-family: \'bolt\'">' + entity + '</span>' + html;
	}
	var icons = {
			'icon-reorder' : '&#xf0c9;',
			'icon-map-marker' : '&#xf041;',
			'icon-search' : '&#xf002;',
			'icon-question-sign' : '&#xf059;',
			'icon-twitter-sign' : '&#xf081;',
			'icon-google-plus-sign' : '&#xf0d4;',
			'icon-facebook-sign' : '&#xf082;',
			'icon-phone' : '&#xf095;',
			'icon-envelope-alt' : '&#xf0e0;',
			'icon-arrow-left' : '&#xf060;',
			'icon-twitter' : '&#xf099;',
			'icon-print' : '&#xf02f;',
			'icon-warning-sign' : '&#xf071;',
			'icon-share' : '&#xf045;',
			'icon-heart' : '&#xf004;',
			'icon-caret-down' : '&#xf0d7;',
			'icon-caret-up' : '&#xf0d8;',
			'icon-caret-left' : '&#xf0d9;',
			'icon-caret-right' : '&#xf0da;',
			'icon-remove' : '&#xf00d;',
			'icon-picture' : '&#xf03e;',
			'icon-calendar' : '&#xf073;',
			'icon-arrow-right' : '&#xf061;',
			'icon-chevron-right' : '&#xf054;',
			'icon-chevron-left' : '&#xf053;',
			'icon-double-angle-left' : '&#xf100;',
			'icon-double-angle-right' : '&#xf101;',
			'icon-angle-left' : '&#xf104;',
			'icon-angle-right' : '&#xf105;',
			'icon-ok' : '&#xf00c;',
			'icon-th' : '&#xf00a;',
			'icon-th-list' : '&#xf00b;',
			'icon-cat-car' : '&#xe001;',
			'icon-cat-edu' : '&#xe000;',
			'icon-cat-free' : '&#xe002;',
			'icon-cat-house' : '&#xe003;',
			'icon-cat-job' : '&#xe004;',
			'icon-cat-sale' : '&#xe005;',
			'icon-cat-service' : '&#xe006;',
			'icon-cat-travel' : '&#xe007;',
			'icon-cat-all' : '&#xe008;',
			'icon-pencil' : '&#xe009;',
			'icon-list-ul' : '&#xf0ca;',
			'icon-list-ol' : '&#xf0cb;',
			'icon-user' : '&#xf007;',
			'icon-camera-retro' : '&#xf083;',
			'icon-plus-sign' : '&#xf055;',
			'icon-remove-sign' : '&#xf057;',
			'icon-ok-sign' : '&#xf058;',
			'icon-minus-sign' : '&#xf056;',
			'icon-lock' : '&#xf023;',
			'icon-happy' : '&#xe00a;'
		},
		els = document.getElementsByTagName('*'),
		i, attr, html, c, el;
	for (i = 0; ; i += 1) {
		el = els[i];
		if(!el) {
			break;
		}
		attr = el.getAttribute('data-icon');
		if (attr) {
			addIcon(el, attr);
		}
		c = el.className;
		c = c.match(/icon-[^\s'"]+/);
		if (c && icons[c[0]]) {
			addIcon(el, icons[c[0]]);
		}
	}
};