'use strict';

let sampleTemplate =
	'<div id="sampleComponent" data-display-index="0">' +
	'<button></button>' +
	'</div>';

if (Handlebars.templates === undefined) {
	Handlebars.templates = {};
}

Handlebars.templates['SampleTemplate'] = Handlebars.compile(sampleTemplate);

/**
 * initialize sets up initial events on the component
 */
module.exports.initialize = () => {
	let $myView = $('#sampleComponent');
	$myView.find('button').click(() => {
		let ajaxOptions = {
			method: 'GET',
			url: '/api/displayIndex',
			success: (data) => {
				$myView.attr('data-display-index', data.displayIndex);
			}
		};

		$.ajax(ajaxOptions);
	});
};
