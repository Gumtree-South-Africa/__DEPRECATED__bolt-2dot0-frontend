'use strict';
require('../_responsiveBreakpointDetection.scss');

let getCurrentBreakpoint = () => {
	if ($('.breakpoint-detector.visible-mobile').is(':visible')) {
		return 'mobile';
	} else {
		return 'desktop';
	}
};

let currentBreakpoint = getCurrentBreakpoint();
$(window).on('resize', () => {
	let newBreakpoint = getCurrentBreakpoint();
	if (newBreakpoint !== currentBreakpoint) {
		currentBreakpoint = newBreakpoint;
		$(window).trigger('breakpointChange', currentBreakpoint);
	}
});
