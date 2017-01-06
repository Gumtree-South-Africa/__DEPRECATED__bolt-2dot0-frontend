'use strict';
let Q = require('q');
let supertest = require('supertest');
let fs = require('fs');
let cwd = process.cwd();

let BapiError = require(`${cwd}/server/services/bapi/BapiError`);
let configService = require(`${cwd}/server/services/configservice`);
let locationService = require(`${cwd}/server/services/location`);
let categoryService = require(`${cwd}/server/services/category`);
let bapiService = require(`${cwd}/server/services/protocols/RESTCall`);
let sitesConfig = require(`${cwd}/server/config/site/sites.json`);
let endpoints = require(`${cwd}/server/config/mock.json`).BAPI.endpoints;

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
			if (typeof locale !== 'undefined') {
				filePath += `${locale}.json`;
			} else {
				filePath += '.json';
			}
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


let verifyMockEndpointsClean = () => {

	console.error("verifyMockEndpointsClean Begin");
	let keys = Object.keys(endpointToFileMap);
	for (let i = 0; i < keys.length; i++) {
		if (endpointToFileMap[keys[i]].length > 0) {
			console.error(`mock endpoint not consumed ${keys[i]}, count ${endpointToFileMap[keys[i]].length}`);
		}
	}
	endpointToFileMap = {};
	console.error("verifyMockEndpointsClean End");
};

// if we don't clean up the endpoints after each test, strange failures can occur
// ex. with two separate tests:
// 		test 1 = register an endpoint to return a file/200 in a test and accidently not consume it
//		test 2 = register an endpoint to return a file/400, for the same endpoint, and consume it, but suprise! your test recieves the file/200
//   	you wonder why when you run test 2 by iteself it works, but when running with other tests it doesn't.
// prevent "leakage" caused by registered but unconsumed mock endpoints
afterEach(() => {
	verifyMockEndpointsClean();
});

/**
 * Populates the mock endpoint map
 * @param url
 * @param file
 * @param options
 * 	ex. failStatusCode: 404 (use "failStatusCode" to force a non-200 promise reject)
 */
let registerMockEndpoint = (url, filePath, options) => {
	if (url.indexOf('_forceExample') === -1) {
		url = `${url}?_forceExample=true&_statusCode=200`;
	}
	if (!endpointToFileMap[url]) {
		endpointToFileMap[url] = [];
	}
	let entry = {
		filePath: filePath,
		options: {}
	};
	if (options) {
		entry.options = options;
	}
	endpointToFileMap[url].push(entry);
};

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
module.exports.boltSupertest = (route, host, method) => {
	if (!method) {
		method = "GET";
	}
	// we need to load only the site we need because if we load all sites, the cache will try to pre-load data and consume registerMockEndpoints
	// if we didnt restrict the site, for data that is cached, we would need to call registerMockEndpoint twice for each site (once for the cache to pre-load, and once for the test)
	let testSite = sitesConfig.sites[host];
	if (!testSite) {
		console.error(`Error: host '${host}' does not match any configured sites`);
		return;
	}
	process.env.SITES = testSite.locale;	// so we don't load all the sites for the test, only what we need for the test, based on host name specifed by the test
	let app = require(cwd + '/app');
	spyOnService(configService, 'getConfigData', `${cwd}/server/config/bapi/config_`);
	spyOnService(categoryService, 'getCategoriesData', `${cwd}/test/serverUnit/mockData/categories/categories_`);
	spyOnService(locationService, 'getLocationsData', `${cwd}/test/serverUnit/mockData/locations/locations_`);

	// we cant spy on endpoints.updateConfig one in the same way, so we register a mock endpoint on it
	// Response file doesn't matter, just the 200, because the updateConfig is to force BAPI to get the latest zookeeper (dev mode only)
	registerMockEndpoint(
		`${endpoints.updateConfig}?_forceExample=true&_statusCode=200`,
		'test/serverUnit/mockData/api/v1/EmptySuccess.json');

	// Mock for endpoint used by cache refresh
	registerMockEndpoint(
		`${endpoints.trendingSearch}?_forceExample=true&_statusCode=200&offset=0&limit=48&minResults=48&withPicsOnly=true`,
		'test/serverUnit/mockData/api/v1/TrendingCard.json');
	registerMockEndpoint(
		`${endpoints.recentActivities}?_forceExample=true&_statusCode=200&limit=50`,
		'test/serverUnit/mockData/api/v1/recentActivity.json');

	let fakeEndpoint = (postData, options) => {
		if (options === null) {
			options = postData;
		}
		let path = options.path;
		if (!endpointToFileMap[path] || endpointToFileMap[path].length === 0) {
			return Q.reject(new BapiError(`No mocked endpoint for ${path}`, {statusCode: 67891}));	// this status code intentional to make searching for it in the code easy (few results)
		}
		let entry = endpointToFileMap[path].shift();	// use shift so its a queue not a stack
		let filePath = entry.filePath;
		try {
			let data = fs.readFileSync(filePath);
			let json = JSON.parse(data);
			if (entry.options.failStatusCode) {
				let error = new BapiError(`simulating failStatusCode: ${entry.options.failStatusCode}`, {statusCode: entry.options.failStatusCode});
				return Q.reject(error);
			}
			return Q(json);
		} catch (e) {
			// we couldnt load the file, but we can simulate a failed promise
			return Q.reject(e);
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
		host = host || 'vivanuncios.com.mx';

		let result = supertest(app);

		if (method === 'GET') {
			result = result.get(route);
		} else if (method === 'POST') {
			result = result.post(route);

			// assume we're going to be posting and receiving json
			result.set('ContentType', 'application/json');
			result.set('Accept', 'application/json');

		} else if (method === 'DELETE') {
			result = result.del(route);

			// assume we're going to be posting and receiving json
			result.set('ContentType', 'application/json');
			result.set('Accept', 'application/json');

		} else {
			console.error(`specHelper - unrecognized "method" parameter: ${method}`);
		}
		// common to all requests regardless of method
		result.set('host', host);
		result.set('user-agent', 'testing');
		return result;
	}).fail((err) => {
		console.error(err);
		console.error(err.stack);
	});
};

module.exports.verifyMockEndpointsClean = verifyMockEndpointsClean;
module.exports.registerMockEndpoint = registerMockEndpoint;
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

/**
 * get Mock Data By Locale - fetch a file from the file system for mock data
 * NOTE: if you need to load a json file (not localized), just use  require like this: require('../../serverUnit/mockData/<dir>/<file>.json');
 * @param mockDataPath - either fully qualified relative to the project root, or relative to the test mockData directory
 * @param fileName - a file name "prefix" (will use <fileName>_<locale>.json), can be empty to use "<locale>.json"
 * @param locale - locale like es_MX
 * @returns json data from specified file
 */
module.exports.getMockDataByLocale = (mockDataPath, fileName, locale) => {
	let fullPath;
	let fullFileName;
	if (fileName.length > 0) {
		// just use locale as file name
		fullFileName = `${fileName}_${locale}.json`;
	} else {
		fullFileName = `${locale}.json`;
	}
	if (mockDataPath.indexOf('/') === -1) {
		fullPath = `${cwd}/test/serverUnit/mockData/${mockDataPath}/${fullFileName}`;
	} else {
		fullPath = `${cwd}${mockDataPath}/${fullFileName}`;
	}
	let file = fs.readFileSync(fullPath);
	return JSON.parse(file);
};


