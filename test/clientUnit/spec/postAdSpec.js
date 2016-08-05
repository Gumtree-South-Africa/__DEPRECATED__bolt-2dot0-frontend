'use strict';

let uploadImageController = require("app/appWeb/views/components/uploadImage/js/uploadImage.js");
let uploadAdController = require("app/appWeb/views/components/uploadImage/js/uploadAd.js");
let ImageHelper = require('app/appWeb/views/components/uploadImage/js/imageHelper.js');
let specHelper = require('../helpers/commonSpecHelper.js');

let mockEpsResponse = 'VERSION:2;http://i.ebayimg.sandbox.ebay.com/00/s/ODAwWDM4Ng==/z/iYgAAOSwGvNXo388/$_1.JPG?set_id=8800005007';
let imageHelper = new ImageHelper({
	IsEbayDirectUL: true
});

let mockPostAdResponse = {
	"id": "1001100557900910658758009",
	"_links": [
		{
			"rel": "self",
			"href": "/ads/1001100557900910658758009",
			"method": "GET"
		},
		{
			"rel": "vipSeoUrl",
			"href": "/a-venta-inmuebles/2-de-octubre/post-house-ad-from-bapi-at-2016+07+22-00-57-24-085/1001100557900910658758009",
			"method": "GET"
		}
	]
};


fdescribe('Post Ad', () => {
	describe('Upload Image (mobile)', () => {
		let $testArea;
		let file;
		beforeEach(() => {
			$testArea = specHelper.setupTest("uploadImage_es_MX", {
				eps: {
					epsUploadExternalURL: '/eps',
					isEbayDirectUploadEnabled: true
				}
			}, "es_MX");
			specHelper.registerMockAjax('/eps', mockEpsResponse);
			specHelper.registerMockAjax('/api/postad/create', mockPostAdResponse);
			file = {
				size: 1024,
				name: 'asdf.png'
			};
		});

		it('Should update background image after EPS', () => {
			uploadImageController.initialize();
			uploadImageController.loadData(0, file);

			let $imagePreview = $testArea.find('.user-image');
			let imageUrl = imageHelper.convertThumbImgURL18(imageHelper.getThumbImgURL(mockEpsResponse));
			expect($imagePreview.css('background-image')).toBe(`url("${imageUrl}")`);
		});

		it('Should not request location if cookie is set', () => {
			let postAd = uploadAdController.postAd;
			spyOn(uploadAdController, 'postAd').and.callFake((images, success, fail, options) => {
				postAd(images, (response) => {
					expect(options.locationType).toBe('cookie');
					expect(response).toBe(mockPostAdResponse);
					success(response);
				}, fail, options);
			});
			document.cookie = 'geoId=123ng456';
			uploadImageController.initialize();
			uploadImageController.loadData(0, file);
		});
	});
});
