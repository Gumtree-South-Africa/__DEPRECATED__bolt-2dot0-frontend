/*eslint no-fallthrough: 0*/

'use strict';

let SimpleEventEmitter = require('public/js/common/utils/SimpleEventEmitter.js');
let clientHbs = require("public/js/common/utils/clientHandlebars.js");

let clientHbsInitialized = false;

function initializeClientHbsIfNot() {
	if (!clientHbsInitialized) {
		clientHbsInitialized = true;
		clientHbs.initialize({translationBlockId: "translation-block"});
	}
}

class AdFeatureSelection {
	constructor() {
		initializeClientHbsIfNot();
		this.propertyChanged = new SimpleEventEmitter();
	}

	componentDidMount(domElement) {
		this.$form = domElement.find(".ad-features");
	}
	/**
	 * renders the custom attributes using handlebars client side templating
	 * @param modelData js object to use for templating
	 * @private
	 */
	render(modelData, adId, insertionFee, cancelLink) {
		// empty the contents of the form
		this.$form.empty();
		this.insertionFee = 0;

		if (modelData) {
			// generate the dom string using handlebars
			let newDomString = clientHbs.renderTemplate(`adFeatureSelection`, modelData);
			// unwrapping the dom to remove the div already in the page as this.$form
			this.$form.append($(newDomString).unwrap());
			this._bindEvent();
		}

		if(insertionFee) {
			let infInput = $(document.createElement('input')).attr("name", "insertionFee").addClass("hidden").val(adId + "|insertionFee");
			this.$form.find(".insertionFee-wrapper").html(infInput);
			this.insertionFee = insertionFee;
		}
		$(this.$form.find(".cancel-link")).prop("href", cancelLink);
	}

	_bindEvent() {

		// Feature Checkbox event
		$(this.$form.find(".input-checkbox")).on("click", () => {
			this._updateCheckoutPrice();
			this.$form.find(".mobile-cancel").toggleClass("hidden", true);
			this.$form.find(".desktop-cancel").find(".cancel-link").toggleClass("hidden", true);
			this.$form.find(".mobile-checkout").toggleClass("hidden", false);
			this.$form.find(".desktop-checkout").toggleClass("hidden", false);
		});

		// Feature option event
		$(this.$form.find("select")).change(() => {
			this._updateCheckoutPrice();
		});

		// Feature checkout submit event
		$(this.$form.find(".checkout-button")).on("click", (e) => {
			e.preventDefault();
			e.stopImmediatePropagation();
			// Clean unsupported fields for 1.0 promote
			for (let input of this.$form.find("input[type='checkbox']")) {
				if (input && !($(input).prop("checked"))) {
					let name = $(input).prop("name");
					$(this.$form.find("select[name='" + name + "']")).prop("name", ""); // Don't checkout un-submit feature
				}
			}
			this.$form.find("input[type='checkbox']").prop('name','');
			this.$form.find("#promote-checkout-form").submit();
		});
	}

	_updateCheckoutPrice() {
		let price = this.insertionFee;
		for (let input of this.$form.find("input[type='checkbox']")) {
			if (input && $(input).prop("checked")) {
				let name = $(input).prop("name");
				price += this._getFeatureOptionPrice(name);
			}
		}
		this.$form.find(".price-amount").text("$" + price);
	}

	_getFeatureOptionPrice(feature) {
		let select = this.$form.find("select[name='" + feature + "']");
		let selectVal = select.val();
		return new Number(select.find("option[value='" + selectVal + "']").html().match(/\$(\d+)+/)[1]);
	}
}

module.exports = AdFeatureSelection;
