'use strict';

let initialize = () => {
	// update title input char count
	$('.title-input').on('keyup', (event) => {
		$('.char-count').text(event.target.value.length);
	});
};

module.exports = {
	initialize
};



