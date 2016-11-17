'use strict';

let SearchpagePO = require('./SearchpagePO');
let searchpagePO = new SearchpagePO();

describe('Searchpage Spec', () => {

	beforeAll(() => {
		searchpagePO.visitPage();	// 'prime' the page visit (this will not have a cookie, so will render the 1.0 home page)

		// since we're adding a cookie after the page is visited (this is apparently the way protractor wants us to do it)
		// we need to then visit the page again (in beforeEach) to have the cookie go to the server

		// set cookies
		browser.manage().addCookie('alreadyVisited', 'true', '/', searchpagePO.getDomain());
		browser.manage().addCookie('b2dot0Version', '2.0', '/', searchpagePO.getDomain());
	});


	describe('Search Page', () => {

		beforeEach(() => {
			searchpagePO.visitPage();
		});

		it('should visit with the 2.0 cookie value', () => {
			browser.manage().getCookie('b2dot0Version').then(function(cookie) {
				expect(cookie.value).toEqual('2.0');
			});
		});
	});
});
