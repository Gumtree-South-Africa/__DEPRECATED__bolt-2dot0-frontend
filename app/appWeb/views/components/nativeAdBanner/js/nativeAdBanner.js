'use strict';

class NativeAdBanner {
	initialize() {
		this.$vipIframePartnerForm = $('#vip_iframe_partner_form');
		this.$vipIframePartnerForm.submit();
	}
}

module.exports = new NativeAdBanner();
