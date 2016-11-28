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
 *   - customAttributeMetadata, the metadata returned from /api/postad/customattributes/:categoryId
 */
class PostFormCustomAttributes {
	constructor() {
		initializeClientHbsIfNot();

		this.propertyChanged = new SimpleEventEmitter();

		this._categoryId = 0;
		this._customAttributeMetadata = null;
	}

	/**
	 * Lifecycle callback which will be called when component has been loaded
	 * @param domElement The jquery object for the root element of this component
	 */
	componentDidMount(domElement) {
		this.$form = domElement;

		this.propertyChanged.addHandler((propName, newValue) => {
			if (propName !== 'categoryId') {
				return;
			}

			$.ajax({
				url: `/api/postad/customattributes/${newValue}`,
				method: "GET",
				contentType: "application/json",
				success: (customAttrData) => {
					if (newValue !== this._categoryId) {
						// This is to ensure the attributes will be for the latter one
						// even if the category is changed during the attribute loading and the attributes
						// loaded for latter one return earlier than former one.
						return;
					}
					// Mixin required property
					if (customAttrData.verticalCategory && customAttrData.verticalCategory.requiredCustomAttributes &&
						customAttrData.verticalCategory.requiredCustomAttributes.length) {
						let requiredAttributes = customAttrData.verticalCategory.requiredCustomAttributes;
						customAttrData.customAttributes.forEach(
							attr => attr.required = requiredAttributes.indexOf(attr.name) >= 0);
					}

					this.customAttributeMetadata = customAttrData;
				},
				error: () => {
					this.customAttributeMetadata = null;
				}
			});
		});

		this.propertyChanged.addHandler((propName, newValue) => {
			if (propName === 'customAttributeMetadata') {
				this._render(newValue);
			}
		});

		this._bindDependencyEvents();
	}

	get categoryId() {
		return this._categoryId;
	}

	set categoryId(newValue) {
		if (this._categoryId === newValue) {
			return;
		}
		this._categoryId = newValue;
		this.propertyChanged.trigger('categoryId', newValue);
	}

	get customAttributeMetadata() {
		return this._customAttributeMetadata;
	}

	set customAttributeMetadata(newValue) {
		if (this._customAttributeMetadata === newValue) {
			return;
		}
		this._customAttributeMetadata = newValue;
		this.propertyChanged.trigger('customAttributeMetadata', newValue);
	}

	/**
	 * renders the custom attributes using handlebars client side templating
	 * @param modelData js object to use for templating
	 * @private
	 */
	_render(modelData) {
		// unbind any events that have been bound to list items to prevent dom leakage
		this._unbindDependencyEvents();

		// empty the contents of the form
		this.$form.empty();

		if (modelData) {
			// generate the dom string using handlebars
			let newDomString = clientHbs.renderTemplate(`postFormCustomAttributes`, modelData);

			// unwrapping the dom to remove the div already in the page as this.$form
			this.$form.append($(newDomString).unwrap());

			// rebind the dependency events to the custom attributes
			this._bindDependencyEvents();

			$(".post-ad-custom-attributes-form").find(".form-field").on("change", (e) => {
				window.BOLT.trackEvents({"event": "PostAd" + $(e.currentTarget).attr("data-field")});
			});
		}
	}

	/**
	 * unbind change events from list items with depdencies
	 * @private
	 */
	_unbindDependencyEvents() {
		this.$form.find('.edit-ad-select-box[data-dependency="true"]').off("change");
	}

	/**
	 * add new select box options to tome
	 * @param $selectBox select box to add options to
	 * @param valuesArr array of values to add to the select box
	 * @private
	 */
	_insertSelectBoxOptions($selectBox, valuesArr) {
		let appendString = "";
		$selectBox.empty();
		$selectBox.append('<option value="" selected="selected"> --- </option>');
		valuesArr.forEach((val) => {
			appendString += `<option value="${val.value}">${val.localizedValue}</option>`;
		});
		$selectBox.append(appendString);

	}

	/**
	 * loop over dependents and update the values for all dependent select boxes
	 * @param dependents
	 * @private
	 */
	_updateDependentsLists(dependents) {
		dependents.forEach((dependent) => {
			this._insertSelectBoxOptions(this.$form.find(`.edit-ad-select-box[data-attribute=${dependent.name}]`), dependent.values);
		});
	}

	/**
	 * bind dependency update events for changing one text box and updating values of another
	 * @private
	 */
	_bindDependencyEvents() {
		this.$form.find('.edit-ad-select-box[data-dependency="true"]').change((evt) => {
			let $selectBox = $(evt.currentTarget);
			// go get the necessary attribute dependency information that you can get from the server
			$.ajax({
				url: `/api/edit/attributedependencies`,
				type: "POST",
				data: JSON.stringify({
					catId: this.categoryId, // selected category id
					depAttr: $selectBox.data('attribute'), // select box that changed
					depValue: $selectBox.val() // value the select box was changed to
				}),
				dataType: "json",
				contentType: 'application/json',
				success: (data) => {
					this._updateDependentsLists(data);
				},
				failure: () => {
					console.error("Failed to get attribute dependencies from the server");
				}
			});
		});
	}
}

module.exports = PostFormCustomAttributes;
