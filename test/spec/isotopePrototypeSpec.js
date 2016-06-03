/*global describe:false, it:false, beforeEach:false, afterEach:false*/
'use strict';
let supertest = require('supertest'),
	app = require('../../app.js');

let checkAuth = require('../../server/middlewares/check-authentication');

describe('isotope prototpe', () => {

	it('should load the isotope prototype page', (done) => {
		jasmine.createSpy().and.callFake(() => {
			console.log("fake");
		});
		spyOn(checkAuth).and.callFake((args) => {
			console.log(args);
		});
		supertest(app)
			.get('isotopeprototype')
			.expect(200)
			.end();
	});
});
