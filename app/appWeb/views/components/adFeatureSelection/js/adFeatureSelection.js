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
		this.features = null;
	}
	/**
	 * renders the custom attributes using handlebars client side templating
	 * @param modelData js object to use for templating
	 * @private
	 */
	render(modelData) {
		// unbind any events that have been bound to list items to prevent dom leakage
		this.$form = $(".ad-features");
		// empty the contents of the form
		this.$form.empty();

		if (modelData) {
			// generate the dom string using handlebars
			let newDomString = clientHbs.renderTemplate(`adFeatureSelection`, modelData);

			// unwrapping the dom to remove the div already in the page as this.$form
			this.$form.append($(newDomString).unwrap());

			$(this.$form.find(".input-checkbox")).on("click", () => {
				this.$form.find(".mobile-cancel").toggleClass("hidden", true);
				this.$form.find(".cancel-link").toggleClass("hidden", true);
				this.$form.find(".mobile-checkout").toggleClass("hidden", false);
				this.$form.find(".desktop-checkout").toggleClass("hidden", false);
			});

			$(this.$form.find(".checkout-button")).on("click", (e) => {
				e.preventDefault();
				e.stopImmediatePropagation();
				this.$form.find("#promote-checkout-form").submit();
			});
		}
	}
}

module.exports = AdFeatureSelection;
