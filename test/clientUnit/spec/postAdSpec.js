'use strict';

let photoContainerController = require("app/appWeb/views/components/photoContainer/js/photoContainer.js");
let uploadImageController = require("app/appWeb/views/components/uploadImage/js/mobileUpload.js");
let uploadAdController = require("app/appWeb/views/components/uploadImage/js/postAd.js");
let ImageHelper = require('app/appWeb/views/components/uploadImage/js/epsUpload.js');
let specHelper = require('../helpers/commonSpecHelper.js');
let loginModalController = require("app/appWeb/views/components/loginModal/js/loginModal.js");
let postAdModalController = require("app/appWeb/views/components/postAdModal/js/postAdModal.js");
let postAdFormMainDetailsController =
	require("app/appWeb/views/components/postAdFormMainDetails/js/postAdFormMainDetails.js");
let spinnerModalController = require('app/appWeb/views/components/spinnerModal/js/spinnerModal.js');

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

	it('should open and close the login modal when called', () => {
		let $testArea = specHelper.setupTest("loginModal", {
			isHidden: true,
		}, "es_MX");

		loginModalController.initialize();

		expect($testArea.find('#login-modal').hasClass("hidden")).toBeTruthy();
		expect($testArea.find('#login-modal-mask').hasClass("hidden")).toBeTruthy();

		loginModalController.openModal({links:{emailLogin:'',register:'',facebookLogin:''}});

		expect($testArea.find('#login-modal').hasClass("hidden")).toBeFalsy();
		expect($testArea.find('#login-modal-mask').hasClass("hidden")).toBeFalsy();

		loginModalController.closeModal();

		expect($testArea.find('#login-modal').hasClass("hidden")).toBeTruthy();
		expect($testArea.find('#login-modal-mask').hasClass("hidden")).toBeTruthy();
	});

	describe('Post Ad page', () => {
		beforeEach(() => {
			specHelper.mockGoogleLocationApi();

			specHelper.setupTest("postAd_es_MX", {

			}, "es_MX");
			uploadImageController.initialize();
			postAdModalController.initialize();
			postAdFormMainDetailsController.initialize(false);
			spinnerModalController.initialize();
			uploadAdController.initialize();
			uploadAdController.viewModel.componentDidMount();
		});
		it('should call IRS and set component status correctly when image is uploaded', () => {
			specHelper.registerMockAjax('/api/postad/imagerecognition', { categoryId: 1 });
			let postAdViewModel = uploadAdController.viewModel;

			spyOn(postAdViewModel.postAdFormMainDetails, 'show');
			spyOn(spinnerModalController, 'showModal').and.callThrough();
			spyOn(spinnerModalController, 'completeSpinner').and.callFake(completionCb => completionCb());
			specHelper.mockObjectProperty(postAdViewModel.postAdFormMainDetails, 'categoryId', 0);

			postAdViewModel.mobileUpload.propertyChanged.trigger('imageUrl', 'http://fakeUrl/fakePath');

			// Detail form should be shown
			expect(postAdViewModel.postAdFormMainDetails.show).toHaveBeenCalled();
			expect(spinnerModalController.showModal).toHaveBeenCalled();
			expect(spinnerModalController.completeSpinner).toHaveBeenCalled();
			expect(postAdViewModel.postAdFormMainDetails.categoryId).toBe(1);
		});
	});


	describe('Upload Image (mobile)', () => {
		let $testArea;
		let file;

		beforeEach(() => {
			specHelper.mockGoogleLocationApi();
			specHelper.mockWebshim();

			$testArea = specHelper.setupTest("uploadImage", {
				eps: {
					epsUploadExternalURL: '/eps',
					isEbayDirectUploadEnabled: true
				}
			}, "es_MX");
			// Used by editAdFormMainDetails.js
			$testArea.append('<div id="js-main-detail-post"><input title="Title"></div>');
			specHelper.registerMockAjax('/eps', mockEpsResponse);
			specHelper.registerMockAjax('/api/postad/imagerecognition', {});
			file = {
				size: 1024,
				name: 'asdf.png'
			};

			uploadImageController.initialize();
			postAdModalController.initialize();
			postAdFormMainDetailsController.initialize(false);
			spinnerModalController.initialize();
			uploadAdController.initialize();
			uploadAdController.viewModel.componentDidMount();

		});



		// this test out until we can  fix the issue:
		// Can't find variable: google in /Volumes/caseSensitive/bolt-2dot0-frontend/test/clientUnit/SpecRunner.js (line 15858)

		it('Should update background image after EPS', () => {
			specHelper.registerMockAjax('/api/postad/create', mockPostAdResponse);
			spyOn(uploadAdController.viewModel.mobileUpload.propertyChanged, 'trigger');

			uploadImageController.loadData(0, file);

			let $imagePreview = $testArea.find('.user-image');
			let imageUrl = imageHelper.convertThumbImgURL18(imageHelper.getThumbImgURL(mockEpsResponse));

			// phantomJS will strip out the quotes, so we strip the quotes to succeed in Chrome
			expect($imagePreview.css('background-image').replace(/\"/g, "")).toBe(`url(${imageUrl})`);
		});

		it('Should not request location if cookie is set', () => {
			document.cookie = 'geoId=123ng456';
			uploadAdController.requestLocationFromBrowser((locationType) =>
				expect(locationType).toBe('cookie'));
		});
	});

	describe('Main detail form', () => {
		beforeEach(() => {
			specHelper.mockGoogleLocationApi();
			specHelper.mockWebshim();
			specHelper.setupTest("postAdFormMainDetails", {
				'footer': {
					"baseJSUrl": '/public/js/'
				}
			}, "es_MX");

			uploadImageController.initialize();
			postAdModalController.initialize();
			postAdFormMainDetailsController.initialize(false);
			postAdFormMainDetailsController.onReady();
			specHelper.mockObjectProperty(postAdFormMainDetailsController.viewModel, 'isFormValid', true);
			specHelper.mockObjectProperty(postAdFormMainDetailsController.viewModel, 'isFixMode', false);
			spinnerModalController.initialize();
			uploadAdController.initialize();
			uploadAdController.viewModel.componentDidMount();
		});

		it('should be in fix mode for failed ajax', () => {
			specHelper.registerMockAjax('/api/postad/create', {error: 'test error'}, { fail: true, status: 400 });
			postAdFormMainDetailsController._ajaxPostForm();
			expect(postAdFormMainDetailsController.viewModel.isFormValid).toBeFalsy();
			expect(postAdFormMainDetailsController.viewModel.isFixMode).toBeTruthy();
		});
	});

	describe("upload image (desktop)", () => {
		beforeEach(() => {
			specHelper.mockGoogleLocationApi();
			specHelper.mockWebshim();

			specHelper.setupPageTest("postAd", {}, "es_MX");
			specHelper.registerMockAjax('/eps', mockEpsResponse);

			photoContainerController.initialize();
			uploadImageController.initialize();
			postAdModalController.initialize();
			postAdFormMainDetailsController.initialize(false);
			postAdFormMainDetailsController.onReady();
			spinnerModalController.initialize();
			uploadAdController.initialize();
			uploadAdController.viewModel.componentDidMount();
		});

		it('should successfully post ad with created response', () => {
			specHelper.registerMockAjax('/api/postad/create', {
				state: 'AD_CREATED',
				ad: {
					redirectLink: '/'
				}
			});
			spyOn(spinnerModalController, 'completeSpinner');

			let $postAdButton = $('#postAdBtn');
			$postAdButton.click();
			expect(spinnerModalController.completeSpinner).toHaveBeenCalled();
		});

		it('should successfully post ad with deferred response', () => {
			specHelper.registerMockAjax('/api/postad/create', {
				state: 'AD_DEFERRED',
				deferredLink: '/'
			});
			spyOn(spinnerModalController, 'completeSpinner');

			let $postAdButton = $('#postAdBtn');
			$postAdButton.click();
			expect(spinnerModalController.completeSpinner).toHaveBeenCalled();
		});

		it('should fail to post with no images', () => {
			specHelper.registerMockAjax('/api/postad/create', {
				state: 'AD_DEFERRED',
				deferredLink: '/'
			});
			photoContainerController.setFormValid(true);

			let $postAdButton = $('#postAdBtn');
			expect($postAdButton.hasClass('disabled')).toBeTruthy();
		});

		it('should error out with returned failed ajax', () => {
			specHelper.registerMockAjax('/api/postad/create', {}, {fail: true, status: 500});
			spyOn(spinnerModalController, 'hideModal');


			let $postAdButton = $('#postAdBtn');
			$postAdButton.click();
			expect(spinnerModalController.hideModal).toHaveBeenCalled();
		});
	});
});
