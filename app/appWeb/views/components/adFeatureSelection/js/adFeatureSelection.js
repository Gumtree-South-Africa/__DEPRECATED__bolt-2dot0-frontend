/*eslint no-fallthrough: 0*/

'use strict';

let SimpleEventEmitter = require('public/js/common/utils/SimpleEventEmitter.js');
let clientHbs = require("public/js/common/utils/clientHandlebars.js");

let clientHbsInitialized = false;

function initializeClientHbsIfNot() {
	if (!clientHbsInitialized) {
		clientHbsInitialized = true;
		clientHbs.initialize();
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

	get adId() {
		return this._adId;
	}

	set adId(newValue) {
		this._adId = newValue;
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

			$(".post-ad-custom-attributes-form").find(".form-field").on("change", (e) => {
				window.BOLT.trackEvents({"event": this.pageType + $(e.currentTarget).attr("data-field")});
			});
		}
	}
}

module.exports = AdFeatureSelection;
