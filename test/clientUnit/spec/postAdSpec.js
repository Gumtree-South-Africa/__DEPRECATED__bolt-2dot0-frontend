'use strict';

let uploadImageController = require("app/appWeb/views/components/uploadImage/js/mobileUpload.js");
let PostAdController = require("app/appWeb/views/templates/pages/postAd/js/postAd.js").PostAd;
let ImageHelper = require('app/appWeb/views/components/uploadImage/js/epsUpload.js');
let specHelper = require('../helpers/commonSpecHelper.js');
let loginModalController = require("app/appWeb/views/components/loginModal/js/loginModal.js");
let spinnerModalController = require('app/appWeb/views/components/spinnerModal/js/spinnerModal.js');
let formMapController =require('app/appWeb/views/components/formMap/js/formMap.js');

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
let mockGetUrlParameters = () => {
	window.getUrlParameter = function(value) {
		return value;
	};
	$('html').attr('data-locale', 'es_MX');
};


mockGetUrlParameters();
describe('Post Ad', () => {
	window.getUrlParameter(true);
	it('should open and close the login modal when called', () => {
		let $testArea = specHelper.setupTest("loginModal", {
			isHidden: true,
		}, "es_MX");

		loginModalController.initialize();

		expect($testArea.find('#login-modal').hasClass("hidden")).toBeTruthy();
		expect($testArea.find('#login-modal-mask').hasClass("hidden")).toBeTruthy();

		loginModalController.openModal({ links: { emailLogin: '', register: '', facebookLogin: '' } });

		expect($testArea.find('#login-modal').hasClass("hidden")).toBeFalsy();
		expect($testArea.find('#login-modal-mask').hasClass("hidden")).toBeFalsy();

		loginModalController.closeModal();

		expect($testArea.find('#login-modal').hasClass("hidden")).toBeTruthy();
		expect($testArea.find('#login-modal-mask').hasClass("hidden")).toBeTruthy();
	});

	describe('Post Ad page', () => {
		let $testArea, postAdController;
		beforeEach(() => {
			specHelper.mockGoogleLocationApi();
			specHelper.mockWebshim();

			$testArea = specHelper.setupPageTest('postAd', {
				footer: {
					baseJSUrl: '/public/js/'
				}
			}, 'es_MX');

			postAdController = new PostAdController();
			postAdController.componentDidMount($testArea);
		});
		it('should call IRS and set component status correctly when image is uploaded', () => {
			specHelper.registerMockAjax('/api/postad/imagerecognition', { categoryId: 1 });
			spyOn(postAdController.postAdFormMainDetails, 'show');
			spyOn(spinnerModalController, 'showModal').and.callThrough();
			spyOn(spinnerModalController, 'completeSpinner').and.callFake(completionCb => completionCb());
			specHelper.mockObjectProperty(postAdController.postAdFormMainDetails, 'categoryId', 0);

			postAdController.mobileUpload.propertyChanged.trigger('imageUrl', 'http://fakeUrl/fakePath');

			// Detail form should be shown
			expect(postAdController.postAdFormMainDetails.show).toHaveBeenCalled();
			expect(spinnerModalController.showModal).toHaveBeenCalled();
			expect(spinnerModalController.completeSpinner).toHaveBeenCalled();
			expect(postAdController.postAdFormMainDetails.categoryId).toBe(1);
		});
	});


	describe('Upload Image (mobile)', () => {
		let $testArea;
		let file;
		let postAdController;

		beforeEach(() => {
			specHelper.mockGoogleLocationApi();
			specHelper.mockWebshim();

			$testArea = specHelper.setupPageTest('postAd', {
				eps: {
					epsUploadExternalURL: '/eps',
					isEbayDirectUploadEnabled: true
				},
				footer: {
					baseJSUrl: '/public/js/'
				}
			}, 'es_MX');
			specHelper.registerMockAjax('/eps', mockEpsResponse);
			specHelper.registerMockAjax('/api/postad/imagerecognition', {});
			file = {
				size: 1024,
				name: 'asdf.png'
			};

			postAdController = new PostAdController();
			postAdController.componentDidMount($testArea);
		});



		// this test out until we can  fix the issue:
		// Can't find variable: google in /Volumes/caseSensitive/bolt-2dot0-frontend/test/clientUnit/SpecRunner.js (line 15858)

		it('Should update background image after EPS', () => {
			specHelper.registerMockAjax('/api/postad/create', mockPostAdResponse);
			spyOn(postAdController.mobileUpload.propertyChanged, 'trigger');

			uploadImageController.loadData(0, file);

			let $imagePreview = $testArea.find('.user-image');
			let imageUrl = imageHelper.convertThumbImgURL20(imageHelper.getThumbImgURL(mockEpsResponse));
			imageUrl = imageUrl.replace('http://', 'https://')
				.replace('i.ebayimg.sandbox.ebay.com', 'i.sandbox.ebayimg.com');
			// phantomJS will strip out the quotes, so we strip the quotes to succeed in Chrome
			expect($imagePreview.css('background-image').replace(/\"/g, "")).toBe(`url(${imageUrl})`);
		});

		it('Should not request location if cookie is set', () => {
			document.cookie = 'geoId=123ng456';
			postAdController.requestLocationFromBrowser((locationType) =>
				expect(locationType).toBe('cookie'));
		});
	});

	describe('Main detail form', () => {
		let $testArea;
		let postAdController;
		beforeEach(() => {
			specHelper.mockGoogleLocationApi();
			specHelper.mockWebshim();
			$testArea = specHelper.setupPageTest("postAd", {
				'footer': {
					"baseJSUrl": '/public/js/'
				}
			}, 'es_MX');

			postAdController = new PostAdController();
			postAdController.componentDidMount($testArea);
			specHelper.mockObjectProperty(postAdController.postAdFormMainDetails, 'isFormValid', true);
			specHelper.mockObjectProperty(postAdController.postAdFormMainDetails, 'isFixMode', false);
		});

		it('should be in fix mode for failed ajax', () => {
			postAdController.postAdFormMainDetails.setValidationError({});
			expect(postAdController.postAdFormMainDetails.isFormValid).toBeFalsy();
			expect(postAdController.postAdFormMainDetails.isFixMode).toBeTruthy();
		});
	});

	describe("upload image (desktop)", () => {
		let $testArea;
		let postAdController;
		beforeEach(() => {
			specHelper.mockGoogleLocationApi();
			specHelper.mockWebshim();

			$testArea = specHelper.setupPageTest("postAd", {
				footer: {
					baseJSUrl: '/public/js/'
				}
			}, "es_MX");
			specHelper.registerMockAjax('/eps', mockEpsResponse);

			postAdController = new PostAdController();
			postAdController.componentDidMount($testArea);
		});

		it('should successfully post ad with created response', () => {
			specHelper.registerMockAjax('/api/postad/create', {
				state: 'AD_CREATED',
				ad: {
					redirectLink: '/'
				}
			});
			spyOn(spinnerModalController, 'completeSpinner');

			postAdController.desktopImageUrls = ['http://fakeUrl/fakePath'];
			postAdController.submit(false);
			expect(spinnerModalController.completeSpinner).toHaveBeenCalled();
		});

		it('should successfully post ad with deferred response', () => {
			specHelper.registerMockAjax('/api/postad/create', {
				state: 'AD_DEFERRED',
				deferredLink: '/'
			});
			spyOn(spinnerModalController, 'completeSpinner');

			postAdController.desktopImageUrls = ['http://fakeUrl/fakePath'];
			postAdController.submit(false);
			expect(spinnerModalController.completeSpinner).toHaveBeenCalled();
		});

		it('should fail to post with no images', () => {
			specHelper.registerMockAjax('/api/postad/create', {
				state: 'AD_DEFERRED',
				deferredLink: '/'
			});
			let $postAdButton = $('#postAdBtn');
			expect($postAdButton.hasClass('disabled')).toBeTruthy();
		});

		it('should error out with returned failed ajax', () => {
			specHelper.registerMockAjax('/api/postad/create', {}, { fail: true, status: 500 });
			spyOn(spinnerModalController, 'hideModal');

			postAdController.desktopImageUrls = ['http://fakeUrl/fakePath'];
			postAdController.submit(false);
			expect(spinnerModalController.hideModal).toHaveBeenCalled();
		});
	});

	describe("formMap", () => {
		let $testArea;
		window.getUrlParameter(true);
		beforeEach(() => {
			specHelper.mockGoogleLocationApi();
			specHelper.mockWebshim();

			$testArea = specHelper.setupTest('formMap', { formMap: {} }, 'es_MX');
			formMapController.initialize();
			window.formMap.configMap();
		});

		it('test if google api maps has been applied on object window.google', () => {
			spyOn(window.google.maps, 'Map');
			this.map = new google.maps.Map($(".map")[0], {
				center: this.position,
				zoom: this.zoom,
				disableDefaultUI: true,
			});
			expect(google.maps.Map).toHaveBeenCalled();
		});

		it("check if the area is loaded ", () => {
			let switchRangeMarker = $testArea.find('#switchRangeMarker');
			expect(switchRangeMarker.hasClass('toggle-input')).toBeTruthy('should be display checkbox control');

			spyOn(window.formMap, 'setMark');
			window.formMap.setMark();
			expect(window.formMap.setMark).toHaveBeenCalled();
		});

		it("uses precise location ", () => {		
			let switchRangeMarker = $testArea.find('#switchRangeMarker');
			switchRangeMarker.prop('checked', 'checked');		
			window.formMap.setMark();
			expect(window.formMap.typeMark).toBeTruthy();
		});

		it("uses aproximate location ", () => {		
			window.formMap.setMark();
			expect(window.formMap.typeMark).toBeFalsy();
		});

		it("test geolocation ", () => {		
			window.formMap.geolocate();
			// send undefined object, the razon is the navigator object cannot be mocked, already that is protected.
			expect(window.formMap.position).toBeUndefined();		
			// mock position 
			window.formMap.position = { lat: 19.3883633, lng: -99.1744249 };
			window.formMap.setCurrentPosition();
			expect(window.formMap.map).toBeDefined();	
		});

		it("get position of curren view on map ", () => {		
			let position = window.formMap.getPosition();
			expect(position).toBeDefined();		
		});

		it("autocomplete test", () => {		
			window.formMap.initAutocomplete();
			expect(window.formMap.HtmlAutocomplete).toBeDefined();		
		});

		it("events in formMap ", () => {		
			let switchRangeMarker = $testArea.find('#switchRangeMarker');
			window.formMap.position = { lat: 19.3883633, lng: -99.1744249 };
			switchRangeMarker.prop('checked', 'checked');		
			window.formMap.setMark();
			expect(window.formMap.typeMark).toBeTruthy();

			// autocomplete on place_changed
			$("#autocompleteTextBox").val('Polanco V Sección, Ciudad de México');
			expect(window.formMap.position).toBeTruthy();
		});

	});
});
