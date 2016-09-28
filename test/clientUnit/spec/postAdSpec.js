'use strict';

let uploadImageController = require("app/appWeb/views/components/uploadImage/js/mobileUpload.js");
let uploadAdController = require("app/appWeb/views/components/uploadImage/js/postAd.js");
let ImageHelper = require('app/appWeb/views/components/uploadImage/js/epsUpload.js');
let specHelper = require('../helpers/commonSpecHelper.js');

let mockEpsResponse = 'VERSION:2;http://i.ebayimg.sandbox.ebay.com/00/s/ODAwWDM4Ng==/z/iYgAAOSwGvNXo388/$_1.JPG?set_id=8800005007';
let imageHelper = new ImageHelper.EpsUpload({
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

describe('Post Ad', () => {
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
			file = {
				size: 1024,
				name: 'asdf.png'
			};
		});

		// this test out until we can  fix the issue:
		// Can't find variable: google in /Volumes/caseSensitive/bolt-2dot0-frontend/test/clientUnit/SpecRunner.js (line 15858)

		it('Should update background image after EPS', () => {
			specHelper.registerMockAjax('/api/postad/create', mockPostAdResponse);
			uploadImageController.initialize();
			uploadImageController.loadData(0, file);

			let $imagePreview = $testArea.find('.user-image');
			let imageUrl = imageHelper.convertThumbImgURL18(imageHelper.getThumbImgURL(mockEpsResponse));

			// phantomJS will strip out the quotes, so we strip the quotes to succeed in Chrome
			expect($imagePreview.css('background-image').replace(/\"/g, "")).toBe(`url(${imageUrl})`);
		});

		it('Should not request location if cookie is set', () => {
			specHelper.registerMockAjax('/api/postad/create', mockPostAdResponse);
			let postAd = uploadAdController._postAd;
			spyOn(uploadAdController, '_postAd').and.callFake((images, success, fail, options) => {
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

		it('should show spinners during upload', () => {
			specHelper.registerMockAjax('/api/postad/create', mockPostAdResponse);
			let postAd = uploadAdController._postAd;
			spyOn(uploadAdController, '_postAd').and.callFake((images, success, fail, options) => {
				postAd(images, (response) => {
					expect(options.locationType).toBe('cookie');
					expect($('#js-upload-spinner').hasClass('hidden')).toBeFalsy('Expected the old spinner to be present.');
					expect(response).toBe(mockPostAdResponse);
					success(response);
				}, fail, options);
			});
			document.cookie = 'geoId=123ng456';
			uploadImageController.initialize();
			uploadImageController.loadData(0, file);
			expect($('#js-upload-spinner').hasClass('hidden')).toBeFalsy('Expected the spinner to be gone.');
		});

		it('should show error modal for failed ajax', () => {
			specHelper.registerMockAjax('/api/postad/create', {error: 'test error'}, {fail: true});
			let postAd = uploadAdController._postAd;
			spyOn(uploadAdController, '_postAd').and.callFake((images, success, fail, options) => {
				postAd(images, success, (err) => {
					expect($('#js-upload-spinner').hasClass('hidden')).toBeFalsy('Expected the spinner to be present.');
					fail(err);
				}, options);
			});
			document.cookie = 'geoId=123ng456';
			uploadImageController.initialize();
			uploadImageController.loadData(0, file);
		});
	});
});
