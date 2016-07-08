'use strict';
let Q = require('q');
let supertest = require('supertest');
let fs = require('fs');
let cwd = process.cwd();
let configService = require(`${cwd}/server/services/configservice`);
let locationService = require(`${cwd}/server/services/location`);
let categoryService = require(`${cwd}/server/services/category`);
let bapiService = require(`${cwd}/server/services/bapi/BAPICall`);


/**
 * Takes in a service string and then spies on the method to return the file.
 * If you give it a relative path it will grab the file out of
 * /test/serverUnit/mockData/api/v1/.
 * otherwise it will pull the absolute path.
 *
 * If BAPIheaders are seen in the call, it thinks it's seeing a config call
 * and it will pull in language/region specific config files
 * @param service service name
 * @param method method name
 * @param fileName file name
 */
let spyOnService = (service, method, fileName) => {
	let path = fileName;
	if (fileName.indexOf('/') === -1) {
		path = `${cwd}/test/serverUnit/mockData/api/v1/${fileName}`;
	}
	spyOn(service, method).and.callFake((bapiHeaders) => {
		let filePath = path;
		if (bapiHeaders) {
			let locale = bapiHeaders.locale;
			filePath += `${locale}.json`;
		}
		let file = fs.readFileSync(filePath);
		let json = JSON.parse(file);
		return Q(json);
	});
};

/**
 * The map that stores endpoints as keys and files as values
 */
let endpointToFileMap = {};

/**
 * This is a wrapper for supertest to wait for all the config data to load
 * Prevents a race condition where the app would synchronously try and get config data
 * that was populated by an async bapi call before the bapi call finished.
 * also adds in host and useragent so middleware doesn't fail out
 * @param app app.js from the root
 * @param route a route to supertest
 * @param host an optional host identifier for locale
 * @returns {*|Promise.<supertest>} returns a promise that resolves to supertest
 *  call .then((supertest) => { supertest.expect/end() etc. }) on result from promise
 */
module.exports.boltSupertest = (route, host) => {
	let app = require(cwd + '/app');
	spyOnService(configService, 'getConfigData', `${cwd}/server/config/bapi/config_`);
	spyOnService(categoryService, 'getCategoriesData', `${cwd}/test/serverUnit/mockData/categories/categories_`);
	spyOnService(locationService, 'getLocationsData', `${cwd}/test/serverUnit/mockData/locations/locations_`);

	let fakeEndpoint = (options) => {
		let path = options.path;
		if (!endpointToFileMap[options.path]) {
			throw new Error(`No mocked endpoint for ${path}`);
		} else {
			let filePath = endpointToFileMap[path].pop();
			if (filePath === undefined) {
				throw new Error(`No mocked endpoint for ${path}`);
			}
			let data = fs.readFileSync(filePath);
			let json = JSON.parse(data);
			return Q(json);
		}
	};

	spyOn(bapiService, 'doGet').and.callFake(fakeEndpoint);
	spyOn(bapiService, 'doPost').and.callFake(fakeEndpoint);

	/**
	 * Waits for all the express apps to finish loading
	 * Then it adds host (optional param, defaults to gumtree.co.za)
	 */
	return app.createSiteApps().then(() => {
		console.warn('Server started');
		host = host || 'gumtree.co.za';

		return supertest(app)
			.get(route)
			.set('host', host)
			.set('user-agent', 'testing');
	});
};

/**
 * Populates the mock endpoint map
 * @param url
 * @param file
 */
module.exports.registerMockEndpoint = (url, file) => {
	if (!endpointToFileMap[url]) {
		endpointToFileMap[url] = [];
	}
	endpointToFileMap[url].push(file);
};

module.exports.spyOnService = spyOnService;

/**
 * wrapper for supertest end function to expect errors and call done()
 * Usage: supertest.get(..).end(finish(done));
 * @param done
 * @returns {function()}
 */
module.exports.finish = (done) => {
	return (err) => {
		expect(err).toBe(null, 'Expected no errors');
		done();
	};
};
