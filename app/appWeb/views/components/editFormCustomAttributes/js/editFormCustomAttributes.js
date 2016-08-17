'use strict';

let clientHbs = require("public/js/common/utils/clientHandlebars.js");

class EditFormCustomAttributes {
	_render(modelData) {
		let $parentWrapper = this.$form.parent();

		this._unbindDependencyEvents();

		$parentWrapper.empty();
		let newDomString = Handlebars.partials[`editFormCustomAttributes_${this.locale}`](modelData);

		$parentWrapper.append(newDomString);

		this._bindDependencyEvents();
	}

	_unbindDependencyEvents() {
		this.$form.find('.edit-ad-select-box[data-dependency="true"]').off("change");
	}

	_insertSelectBoxOptions($selectBox, valuesArr) {
		$selectBox.empty();
		$selectBox.append('<option value="default" selected="selected"> --- </option>');
		valuesArr.forEach((val) => {
			$selectBox.append(`<option value="${val.value}">${val.localizedValue}</option>`);
		});
	}

	_updateDependentsLists(dependents) {
		Object.keys(dependents).forEach((dependentName) => {
			this._insertSelectBoxOptions(this.$form.find(`.edit-ad-select-box[data-attribute=${dependentName}]`), dependents[dependentName]);
		});
	}

	_bindDependencyEvents() {
		this.$form.find('.edit-ad-select-box[data-dependency="true"]').change((evt) => {
			let $selectBox = $(evt.currentTarget);

			$.ajax({
				url: `/api/edit/attributedependencies`,
				type: "POST",
				data: JSON.stringify({
					catId: 65,
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

	updateCustomAttributes(catId) {
		$.ajax({
			url: `/api/edit/customattributes/${catId}`,
			method: "GET",
			contentType: "application/json",
			success: (customAttrData) => {
				this._render(customAttrData);
			}
		});
	}

	_bindEvents() {
		this.$inputFields = $("input[data-validation='NUMBER']");
		this.$inputFields.on('keydown', (e) => {
			if (e.keyCode > 57 || e.keyCode < 48) {
				switch (e.keyCode) {
					case 8:
					case 9:
					case 13:
					case 37:
					case 39:
						break;
					default:
						e.preventDefault();
						break;
				}
			}
		});
	}

	_unbindEvents() {
		this.$inputFields.off();
	}

	initialize() {
		this._bindEvents();
		this.$form = $("#edit-ad-custom-attributes-form");
		this.locale = $("#client-hbs-locale").data("locale");
		clientHbs.initialize(this.locale);
		this._bindDependencyEvents();
	}
}

let editFormCustomAttributes = new EditFormCustomAttributes();

module.exports = editFormCustomAttributes;
