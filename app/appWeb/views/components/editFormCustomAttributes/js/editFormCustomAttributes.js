'use strict';

// let myDependency = require("../path/to/dependency");

class EditFormCustomAttributes {
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

	initialize() {
		this.$form = $("#edit-ad-custom-attributes-form");
		this._bindDependencyEvents();
	}
}

let editFormCustomAttributes = new EditFormCustomAttributes();

module.exports = editFormCustomAttributes;
