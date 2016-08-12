'use strict';

let cwd = process.cwd();
let fs = require('fs');
const baseUrl = browser.params.baseUrl;

module.exports.getBaseUrl = () => {
	return baseUrl;
};

module.exports.loadApp = () => {
	return browser.get(baseUrl);
};

/**
 * get Mock Data By Locale - fetch a file from the file system for mock data
 * @param mockDataPath - either fully qualified relative to the project root, or relative to the test mockData directory
 * @param fileName - a file name "prefix" (will use <fileName>_<locale>.json), can be empty to use "<locale>.json"
 * @param locale - locale like es_MX
 * @returns json data from specified file
 */
module.exports.getMockData = (mockDataPath, fileName) => {
	let fullPath;
	let fullFileName = `${fileName}.json`;

	if (mockDataPath.indexOf('/') === -1) {
		fullPath = `${cwd}/test/integration/mockData/${mockDataPath}/${fullFileName}`;
	} else {
		fullPath = `${cwd}${mockDataPath}/${fullFileName}`;
	}
	let file = fs.readFileSync(fullPath);
	return JSON.parse(file);
};
