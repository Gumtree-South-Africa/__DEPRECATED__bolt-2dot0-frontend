'use strict';

class TermsAndConditions {

	_isTermsChecked() {
		return this.$termsCheckbox.is(":checked");
	}

	getCheckedStatus() {
		return {
			hasAcceptedTerms: this._isTermsChecked(),
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

		this.$button = this.$form.find(".save-terms-btn");

		this.$termsCheckbox.on('change', () => {
			if (this._termsChangeCb) {
				this._termsChangeCb();
			}

			let shouldDisable = !this._isTermsChecked();
			if (this.$button.length > 0) {
				this.$button.attr('disabled', shouldDisable);
			}
		});
	}
}

module.exports = new TermsAndConditions();
