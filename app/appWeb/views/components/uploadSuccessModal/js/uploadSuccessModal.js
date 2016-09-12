'use strict';

let initialize = () => {
	$('#success-modal-close-btn').on('click', () => {
		$('#js-success-modal').toggleClass('hidden');
		$('#js-success-modal-mask').toggleClass('hidden');
	});
};

module.exports = {
	initialize
};
