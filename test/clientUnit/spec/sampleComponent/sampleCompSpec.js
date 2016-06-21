'use strict';

let sampleComponent = require('../../mock/sampleComponent.js');
let specHelper = require('../../helpers/commonSpecHelper.js');

describe('Sample Component', () => {
	it('should change text on click', () => {
		let $testArea = specHelper.prepareTemplate('SampleTemplate', {}),
			$sampleComponent = $testArea.find('#sampleComponent');

		specHelper.registerMockAjax('/api/displayIndex', { displayIndex: 1 });

		sampleComponent.initialize();
		
		expect($sampleComponent.attr('data-display-index')).toEqual('0');
		
		$testArea.find('button').click();
		
		expect($sampleComponent.attr('data-display-index')).toEqual('1', 'Display Index Should Be Updated on Button Click');
	});
});
