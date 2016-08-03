'use strict';

let uploadImageController = require("app/appWeb/views/components/uploadImage/js/uploadImage.js");
let specHelper = require('../helpers/commonSpecHelper.js');

fdescribe('Image Upload', () => {
	it('', () => {
		let $testArea = specHelper.setupTest("uploadImage_es_MX", {}, "es_MX");
		uploadImageController.initialize();
		uploadImageController.loadData(0, {
			size: 1024,
			name: 'asdf.png'
		});

		let $postForm = $testArea.find('#mobileFileUpload');
		let event = jQuery.Event('change');
		$postForm.trigger(event);
		// let $errorMessage = $('#js-error-title');
		// expect($errorMessage.text().trim()).toBe('postAd.unsupportedFileModal.error');
	});
});
