'use strict';


let $ = require("jquery");
let clientHbsHelpers = require("public/js/common/utils/clientHbsHelpers.js");
let _ = require("underscore");

let mockAjaxMapQueue = [];

window.TEST = {
	Handlebars
};

// fix HBS Template Helpers for the Client
clientHbsHelpers.initialize(window.TEST.Handlebars);

window.TEST.Handlebars.registerHelper('i18n', (key) => {
	return key;
});


/**
 * Prepare client template and return that DOM after appending to the screen
 * @param {string} templateName - key for template to render
 * @param {object} templateModel - model to use in template render
 * @returns {jQuery} return testArea
 */
let _prepareTemplate = (templateName, templateModel) => {
	let template = window.TEST.Handlebars.partials[templateName];

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
	let queueObj = _.findWhere(mockAjaxMapQueue, { url: url.replace(/[^\u0000-\u007E]/g, "") });
	if (queueObj) {
		queueObj.queue.push({
			returnData,
			options
		});
	} else {
		mockAjaxMapQueue.push({
			url: url.replace(/[^\u0000-\u007E]/g, ""),
			queue: [{
				returnData,
				options
			}]
		});
	}
};

/**
 * dequeue item from mockAjaxMapQueue by url
 * @param {string} url - url endpoint to get data from
 * @returns {object} - mocked data
 */
let _dequeue = (url) => {
	let queueObj = _.findWhere(mockAjaxMapQueue, {url: url.replace(/[^\u0000-\u007E]/g, "")});
	if (!queueObj) {
		throw Error('No Registered Mock Ajax for url -> ' + url);
	}

	let ajaxInfo = queueObj.queue.shift();
	if (queueObj.queue.length <= 0) {
		mockAjaxMapQueue.splice(mockAjaxMapQueue.indexOf(queueObj), 1);
	}

	return ajaxInfo;
};

let simulateTextInput = ($input, text) => {
	$input.val(text);
	$input.trigger("input").trigger("keyup").focus();
};

let setCookie = (cookieName, cookieValue) => {
	document.cookie = `${cookieName}=${cookieValue};path=/`;
};

let getCookie = (cookieName) => {
		let name = cookieName + "=";
		let ca = document.cookie.split(';');
		for (let i = 0; i < ca.length; i++) {
			let c = ca[i];
			while (c.charAt(0) === ' ') {
				c = c.substring(1);
			}
			if (c.indexOf(name) === 0) {
				return c.substring(name.length, c.length);
			}
		}
		return "";
};

let disableFormWarning = () => {
	window.onbeforeunload = () => {};
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
	$("html").attr("data-locale", locale);
	return _prepareTemplate(templateName, templateModel);
};


let mockWebshim = () => {
	registerMockAjax("/public/js/libraries/webshims/shims/form-core.js", {});
	registerMockAjax("/public/js/libraries/webshims/shims/combos/10.js", {});
	registerMockAjax("/public/js/libraries/webshims/shims/combos/3.js", {});
	registerMockAjax("/public/js/libraries/webshims/shims/combos/17.js", {});
	registerMockAjax("/public/js/libraries/webshims/shims/form-shim-extend.js", {});
};

module.exports = {
	simulateTextInput,
	setupTest,
	registerMockAjax,
	setCookie,
	getCookie,
	disableFormWarning,
	mockWebshim
};

// spying on ajax and replacing with fake, mock function
beforeEach(() => {
	spyOn($, 'ajax').and.callFake((options) => {
		let ajaxInfo = _dequeue(options.url);
		if (!ajaxInfo) {
			throw new Error(`no mocked endpoint for ${options.url}`);
		}
		if (ajaxInfo.options) {
			if (ajaxInfo.options.fail) {
				options.error(ajaxInfo.returnData);
			} else if (ajaxInfo.delay && Number.isInteger(ajaxInfo.delay)) {
				setTimeout(() => {
					let successCallback = (ajaxInfo.success) ? ajaxInfo.success : options.success;
					successCallback(ajaxInfo.returnData);
				}, ajaxInfo.delay);
			} else {
				let successCallback = (ajaxInfo.options.success) ? ajaxInfo.options.success : options.success;
				successCallback(ajaxInfo.returnData);
			}
		} else {
			options.success(ajaxInfo.returnData);
		}
	});
});

afterEach(() => {
	$("#testArea").empty();
});
