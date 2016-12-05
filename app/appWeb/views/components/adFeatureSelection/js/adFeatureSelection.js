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
/**
 * A form to fill in custom attributes.
 *
 * - Events:
 *   - propertyChanged, triggered with propertyName and newValue
 *
 * - Properties:
 *   - categoryId
 *   - loadBaseUrl, base url to load custom attribute metadata. This is because metadata of same category
 *     from different URL can be different (for example, metadata for non-vertical category will be empty)
 *   - customAttributeMetadata, the metadata returned from <loadBaseUrl>/:categoryId
 */
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
	render(modelData, insertionFee, cancelLink) {
		// empty the contents of the form
		this.$form.empty();
		this.totalPrice = 0;
		if(insertionFee) {
			$(this.$form.find("#insertionFee")).val(insertionFee);
			this.totalPrice = insertionFee;
		}
		$(this.$form.find(".cancel-link")).prop("href", cancelLink);

		this.unSelectedFeatures = [];
		modelData.forEach((item) => {
			this.unSelectedFeatures.push(item.name);
		});

		if (modelData) {
			// generate the dom string using handlebars
			let newDomString = clientHbs.renderTemplate(`adFeatureSelection`, modelData);
			// unwrapping the dom to remove the div already in the page as this.$form
			this.$form.append($(newDomString).unwrap());
			this._bindEvent();
		}
	}

	_bindEvent() {
		$(this.$form.find(".input-checkbox")).on("click", (e) => {
			let checked = $(e.target).prop("checked");
			let feature = $(e.target).prop("name");
			let price = this._getFeaturePrice(feature);
			this._updateFeatures(feature, checked, price);
			this.$form.find(".mobile-cancel").toggleClass("hidden", true);
			this.$form.find(".desktop-cancel").find(".cancel-link").toggleClass("hidden", true);
			this.$form.find(".mobile-checkout").toggleClass("hidden", false);
			this.$form.find(".desktop-checkout").toggleClass("hidden", false);
		});

		$(this.$form.find(".checkout-button")).on("click", (e) => {
			e.preventDefault();
			e.stopImmediatePropagation();
			this.unSelectedFeatures.forEach((item) => {
				$(this.$form.find("select[name='" + item + "']")).prop("name", ""); // Don't checkout unsubmit feature
			});
			this.$form.find("#promote-checkout-form").submit();
		});
	}

	_getFeaturePrice(feature) {
		let select = this.$form.find("select[name='" + feature + "']");
		let selectVal = select.val();
		return new Number(select.find("option[value='" + selectVal + "']").html().match(/\$(\d+)+/)[1]);
	}

	_updateFeatures(feature, flag, price) {
		if (flag === true) {
			this.unSelectedFeatures = this.unSelectedFeatures.filter((item) => {
				return item !== feature;
			});
			this.totalPrice += price;
		} else {
			this.unSelectedFeatures.push(feature);
			this.totalPrice -= price;
		}
		this.$form.find(".price-amount").text("$" + this.totalPrice);
	}
}

module.exports = AdFeatureSelection;
