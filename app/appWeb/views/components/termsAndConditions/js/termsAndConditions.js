'use strict';

class TermsAndConditions {

	getCheckedStatus() {
		return {
			hasAcceptedTerms: this.$termsCheckbox.is(":checked"),
			marketingConsent: this.$marketingCheckbox.is(":checked")
		};
	}

	initialize(options) {
		options = options || {};
		this._termsChangeCb = options.termsChangeCb;

		this.$form = $("#terms-and-conditions");

		this.$termsCheckbox = this.$form.find('#accept-terms');
		this.$marketingCheckbox = this.$form.find('#marketing-consent');
		this.hasAcceptedTerms = this.$termsCheckbox.is(':checked');

		this.$termsCheckbox.on('change', () => {
			this._termsChangeCb();
		});
	}
}

module.exports = new TermsAndConditions();
