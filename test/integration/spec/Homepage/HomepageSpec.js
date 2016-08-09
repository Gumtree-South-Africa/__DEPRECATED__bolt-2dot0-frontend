'use strict';

let HomepagePO = require('./HomepagePO');
let homepagePO = new HomepagePO();

describe('Homepage Spec', () => {
	beforeEach(() => {
		homepagePO.visitPage();
	});

	it('should navigate to the blog page when clicking the blog link.', () => {
		homepagePO.blogLink.click().then(() => {
			expect(browser.getCurrentUrl()).toEqual('http://blog.vivanuncios.com.mx/');
		});
	});
});
