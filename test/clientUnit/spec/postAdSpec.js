'use strict';

let uploadImageController = require("app/appWeb/views/components/uploadImage/js/uploadImage.js");
let ImageHelper = require('app/appWeb/views/components/uploadImage/js/imageHelper.js');
let specHelper = require('../helpers/commonSpecHelper.js');

let mockEpsResponse = 'VERSION:2;http://i.ebayimg.sandbox.ebay.com/00/s/ODAwWDM4Ng==/z/iYgAAOSwGvNXo388/$_1.JPG?set_id=8800005007';
let imageHelper = new ImageHelper({
	IsEbayDirectUL: true
});

fdescribe('Post Ad', () => {
	describe('Upload Image (mobile)', () => {
		it('Should update background image after EPS', () => {
			let $testArea = specHelper.setupTest("uploadImage_es_MX", {
				eps: {
					epsUploadExternalURL: '/eps',
					isEbayDirectUploadEnabled: true
				}
			}, "es_MX");
			specHelper.registerMockAjax('/eps', mockEpsResponse);

			uploadImageController.initialize();
			uploadImageController.loadData(0, {
				size: 1024,
				name: 'asdf.png'
			});

			let $postForm = $testArea.find('#mobileFileUpload');
			let event = jQuery.Event('change');
			$postForm.trigger(event);
			let $imagePreview = $testArea.find('.user-image');
			let imageUrl = imageHelper.convertThumbImgURL18(imageHelper.getThumbImgURL(mockEpsResponse));
			expect($imagePreview.css('background-image')).toBe(`url("${imageUrl}")`);
		});
	});
});
