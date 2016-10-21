'use strict';

let photoCarousel = require('app/appWeb/views/components/photoCarousel/js/photoCarousel.js');
let specHelper = require('../helpers/commonSpecHelper.js');


describe('Photo Carousel', () => {
	let $testArea;
	beforeEach(() => {
		$testArea = specHelper.setupTest("photoCarousel", {
			eps: {
				epsUploadExternalURL: '/eps',
				isEbayDirectUploadEnabled: true
			}
		}, "es_MX");
	});

	it('should preload photo carousel images', () => {
		spyOn(photoCarousel, '_slickAdd');
		$testArea.append(`<div class='carousel-item'></div><div class='carousel-item'></div><div class='carousel-item'></div>`);
		photoCarousel.initialize({
			initialImages: [
				'asdf',
				'one',
				'two'
			]
		});
		expect(photoCarousel._slickAdd).toHaveBeenCalled();
	});

	it('should prevent adding a file of incorrect type', () => {
		spyOn(console, 'error');
		photoCarousel.initialize();
		photoCarousel.parseFile({
			name: 'test.svg'
		});
		//This is a bad test, function wasn't written in a testable manner
		expect(console.error).toHaveBeenCalledWith('Invalid File Type');
	});

	it('should call failure if eps returns an error', () => {
		photoCarousel.initialize();
		let error = 'ERROR:SD009;';
		let failReturn = photoCarousel._success(0, error);
		expect(failReturn).toBe(error);
	});

	it('should return failure if url is invalid', () => {
		photoCarousel.initialize();
		let error = 'invalid';
		let failReturn = photoCarousel._success(0, error);
		expect(failReturn).toBe(error);
	});

	it('should create image objects on success from eps', () => {
		spyOn(photoCarousel, 'createImgObj');
		spyOn(photoCarousel, 'removePendingImage');
		photoCarousel.initialize();
		photoCarousel.clickFileInput();
		let mockEpsResponse = 'http://i.ebayimg.sandbox.ebay.com/00/s/ODAwWDM4Ng==/z/iYgAAOSwGvNXo388/$_1.JPG?set_id=8800005007';
		let val = photoCarousel._success(0, mockEpsResponse);
		expect(val).toBeUndefined();
		expect(photoCarousel.createImgObj).toHaveBeenCalled();
		expect(photoCarousel.removePendingImage).toHaveBeenCalledWith(0);
	});

});
