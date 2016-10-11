"use strict";

let simulateTextInput = ($input, text) => {
	$input.val(text);
	$input.trigger('input').keyup().focus().change();
};

let simulateSelectBoxSelect = ($selectBox, value) => {
	$selectBox.find(`option:contains(${value})`).prop({selected: true});
	$selectBox.change();
};

let _simulateKeyUp = ($elem, keyCode) => {
	$elem.focus();
	let e = $.Event("keyup");
	e.keyCode = keyCode;
	$elem.trigger(e);
};

let simulateEsc = ($elem) => {
	_simulateKeyUp($elem, 27);
};

let simulateEnter = ($elem) => {
	_simulateKeyUp($elem, 13);
};

let simulateUpArrow = ($elem) => {
	_simulateKeyUp($elem, 38);
};

let simulateDownArrow = ($elem) => {
	_simulateKeyUp($elem, 40);
};

module.exports = {
	simulateSelectBoxSelect,
	simulateTextInput,
	simulateDownArrow,
	simulateUpArrow,
	simulateEnter,
	simulateEsc
};
