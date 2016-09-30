"use strict";

let simulateTextInput = ($input, text) => {
	$input.val(text);
	$input.trigger('input').keyup().focus().change();
};

let simulateSelectBoxSelect = ($selectBox, value) => {
	$selectBox.find(`option:contains(${value})`).prop({selected: true});
	$selectBox.change();
};

module.exports = {
	simulateSelectBoxSelect,
	simulateTextInput
};
