/*eslint no-fallthrough: 0*/

'use strict';

let clientHbs = require("public/js/common/utils/clientHandlebars.js");

class EditFormCustomAttributes {
	_render(modelData) {
		this._unbindDependencyEvents();

		// empty the contents of the form
		this.$form.empty();
		let newDomString = Handlebars.partials[`editFormCustomAttributes_${this.locale}`](modelData);

		// unwrapping the dom to remove the div already in the page as this.$form
		this.$form.append($(newDomString).unwrap());

		this._bindDependencyEvents();
	}

	_unbindDependencyEvents() {
		this.$form.find('.edit-ad-select-box[data-dependency="true"]').off("change");
	}

	_insertSelectBoxOptions($selectBox, valuesArr) {
		let appendString = "";
		$selectBox.empty();
		$selectBox.append('<option value="default" selected="selected"> --- </option>');
		valuesArr.forEach((val) => {
			appendString += `<option value="${val.value}">${val.localizedValue}</option>`;
		});
		$selectBox.append(appendString);

	}

	_updateDependentsLists(dependents) {
		dependents.forEach((dependent) => {
			this._insertSelectBoxOptions(this.$form.find(`.edit-ad-select-box[data-attribute=${dependent.name}]`), dependent.values);
		});
	}

	_bindDependencyEvents() {
		this.$form.find('.edit-ad-select-box[data-dependency="true"]').change((evt) => {
			let $selectBox = $(evt.currentTarget);

			$.ajax({
				url: `/api/edit/attributedependencies`,
				type: "POST",
				data: JSON.stringify({
					catId: this.catId,
					depAttr: $selectBox.data('attribute'),
					depValue: $selectBox.val()
				}),
				dataType: "json",
				contentType: 'application/json',
				success: (data) => {
					this._updateDependentsLists(data);
				}
			});
		});
	}

	setCategoryId(catId) {
		this.catId = catId;
	}

	updateCustomAttributes(postRenderCb) {
		$.ajax({
			url: `/api/edit/customattributes/${this.catId}`,
			method: "GET",
			contentType: "application/json",
			success: (customAttrData) => {
				this._render(customAttrData);
				postRenderCb(customAttrData);
			}
		});
	}

	initialize() {
		this.$form = $("#edit-ad-custom-attributes-form");
		this.locale = $("html").data("locale");
		clientHbs.initialize();
		this._bindDependencyEvents();
	}
}

let editFormCustomAttributes = new EditFormCustomAttributes();

module.exports = editFormCustomAttributes;
