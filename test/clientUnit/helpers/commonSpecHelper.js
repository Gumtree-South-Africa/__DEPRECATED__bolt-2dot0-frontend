'use strict';


let $ = require("jquery");
let clientHbsHelpers = require("./clientHbsHelpers.js");

let mockAjaxMapQueue = {};

// fix HBS Template Helpers for the Client
clientHbsHelpers.initialize();

/**
 * Prepare client template and return that DOM after appending to the screen
 * @param {string} templateName - key for template to render
 * @param {object} templateModel - model to use in template render
 * @returns {jQuery} return testArea
 */
let _prepareTemplate = (templateName, templateModel) => {
	let template = Handlebars.partials[templateName];

	if (!template) {
		throw Error(`No precompiled template with the name -> ${templateName}`);
	}

	let dom = template(templateModel);

	return $('#testArea').append(dom);
};

/**
 * enqueue to mockAjaxMapQueue by url
 * @param {string} url - url endpoint that will be queued
 * @param {object} returnData - returnData to return on dequeue
 */
let _enqueue = (url, returnData, options) => {
	if (mockAjaxMapQueue.hasOwnProperty(url) && Array.isArray(mockAjaxMapQueue[url])) {
		mockAjaxMapQueue[url].push({
			returnData,
			options
		});
	} else if (!mockAjaxMapQueue.hasOwnProperty(url)) {
		mockAjaxMapQueue[url] = [{
			returnData,
			options
		}];
	}
};

/**
 * dequeue item from mockAjaxMapQueue by url
 * @param {string} url - url endpoint to get data from
 * @returns {object} - mocked data
 */
let _dequeue = (url) => {
	if (!mockAjaxMapQueue.hasOwnProperty(url) || !Array.isArray(mockAjaxMapQueue[url])) {
		throw Error('No Registered Mock Ajax for url -> ' + url);
	}

	let ajaxInfo = mockAjaxMapQueue[url].shift();
	if (mockAjaxMapQueue[url].length <= 0) {
		delete mockAjaxMapQueue[url];
	}

	return ajaxInfo;
};

let simulateTextInput = ($input, text) => {
	$input.val(text);
	$input.trigger("input").trigger("keyup").focus();
};

/**
 * Given url and return data, store the mock for use later
 * @param {string} url - url to mock
 * @param {object} returnData - data to be returned from mocked ajax request
 */
let registerMockAjax = (url, returnData, options) => {
	_enqueue(url, returnData, options);
};

let setupTest = (templateName, templateModel, locale) => {
	clientHbsHelpers.setLocale(locale);
	return _prepareTemplate(templateName, templateModel);
};

module.exports = {
	simulateTextInput,
	setupTest,
	registerMockAjax
};

// spying on ajax and replacing with fake, mock function
beforeEach(() => {
	spyOn($, 'ajax').and.callFake((options) => {
		let ajaxInfo = _dequeue(options.url);

		if (ajaxInfo.options) {
			if (ajaxInfo.delay && Number.isInteger(ajaxInfo.delay)) {
				setTimeout(() => {
					options.success(ajaxInfo.returnData);
				}, ajaxInfo.delay);
			}
		} else {
			options.success(ajaxInfo.returnData);
		}

	});
});
