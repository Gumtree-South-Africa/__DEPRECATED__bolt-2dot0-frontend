/*eslint no-fallthrough: 0*/

'use strict';

let clientHbs = require("public/js/common/utils/clientHandlebars.js");

class EditFormCustomAttributes {
	_render(modelData) {

		this._unbindEvents();
		this._unbindDependencyEvents();

		// empty the contents of the form
		this.$form.empty();
		let newDomString = Handlebars.partials[`editFormCustomAttributes_${this.locale}`](modelData);

		// unwrapping the dom to remove the div already in the page as this.$form
		this.$form.append($(newDomString).unwrap());

		this._bindDependencyEvents();
		this._bindEvents();
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

	_bindEvents() {
		this.$inputFields = $("input[data-validation='NUMBER']");
		this.$inputFields.on('keydown', (e) => {
			if ((e.keyCode > 57 || e.keyCode < 48)) {
				switch (e.keyCode) {
					case 8://backspace
					case 9://tab
					case 13://delete
					case 37://left arrow
					case 39://right arrow
					case 189: //negative
						break;
					default:
						e.preventDefault();
						break;
				}
			} else if (e.ctrlKey) {
				switch (e.keyCode) {
					case 65: //Ctrl-a
					case 67: // ctrl-c
					case 86: // ctrl-v
						break;
					default:
						e.preventDefault();
						break;
				}
			} else if (e.shiftKey) {
				//Prevent special characters (shift + number: !**@#%)
				e.preventDefault();
			}
		});
	}

	_unbindEvents() {
		this.$inputFields.off();
	}

	initialize() {
		this._bindEvents();
		this.$form = $("#edit-ad-custom-attributes-form");
		this.locale = $("html").data("locale");
		clientHbs.initialize();
		this._bindDependencyEvents();
	}
}

let editFormCustomAttributes = new EditFormCustomAttributes();

module.exports = editFormCustomAttributes;
