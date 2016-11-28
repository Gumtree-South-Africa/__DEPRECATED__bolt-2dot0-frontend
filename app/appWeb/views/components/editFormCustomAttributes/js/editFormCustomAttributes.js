/*eslint no-fallthrough: 0*/

'use strict';

let clientHbs = require("public/js/common/utils/clientHandlebars.js");

class EditFormCustomAttributes {

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
		// generate the dom string using handlebars
		let newDomString = clientHbs.renderTemplate(`editFormCustomAttributes`, modelData);

		// unwrapping the dom to remove the div already in the page as this.$form
		this.$form.append($(newDomString).unwrap());

		// rebind the dependency events to the custom attributes
		this._bindDependencyEvents();
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
		$selectBox.append('<option value="default" selected="selected"> --- </option>');
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
					catId: this.catId, // selected category id
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

	/**
	 * sets the category id for the singleton instance
	 * @param catId
	 */
	setCategoryId(catId) {
		this.catId = catId;
	}

	/**
	 * update the whole custom attributes section with the new categories custom attributes
	 * @param postRenderCb
	 */
	updateCustomAttributes(postRenderCb, categoryId) {
		if (categoryId) {
			this.setCategoryId(categoryId);
		}
		$.ajax({
			url: `/api/edit/customattributes/${this.catId}`,
			method: "GET",
			contentType: "application/json",
			success: (customAttrData) => {
				// Mixin required property
				if (customAttrData.verticalCategory && customAttrData.verticalCategory.requiredCustomAttributes &&
					customAttrData.verticalCategory.requiredCustomAttributes.length) {
					let requiredAttributes = customAttrData.verticalCategory.requiredCustomAttributes;
					customAttrData.customAttributes.forEach(
						attr => attr.required = requiredAttributes.indexOf(attr.name) >= 0);
				}

				// render the new results and call the passed in callback
				this._render(customAttrData);
				postRenderCb(customAttrData);
			}
		});
	}

	initialize() {
		this.$form = $("#edit-ad-custom-attributes-form");
		clientHbs.initialize();
		// bind dependency events to the select boxes
		this._bindDependencyEvents();
	}
}

let editFormCustomAttributes = new EditFormCustomAttributes();

module.exports = editFormCustomAttributes;
