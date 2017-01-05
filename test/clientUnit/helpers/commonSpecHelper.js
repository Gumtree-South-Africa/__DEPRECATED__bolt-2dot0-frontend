'use strict';


let clientHbsHelpers = require("public/js/common/utils/clientHbsHelpers.js");
let formChangeWarning = require("public/js/common/utils/formChangeWarning.js");
let simulateInteractionHelpers = require("./simulateInteractionHelpers");
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
	let queueObj = _.findWhere(mockAjaxMapQueue, {url: url.replace(/[^\u0000-\u007E]/g, "")});
	if (queueObj) {
		queueObj.queue.push({
			returnData,
			options
		});
	} else {
		mockAjaxMapQueue.push({
			url: url.replace(/[^\u0000-\u007E]/g, ""),
			queue: [
				{
					returnData,
					options
				}
			]
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
	window.onbeforeunload = () => {
	};
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

let setupPageTest = (templateName, templateModel, locale) => {
	clientHbsHelpers.setLocale(locale);
	$("html").attr("data-locale", locale);
	let template = window.TEST.Handlebars.partials[templateName];
	template(templateModel);

	template = window.TEST.Handlebars.compile('{{> override_content }}');
	let dom = template(templateModel);
	return $('#testArea').append(dom);
};

let mockGoogleLocationApi = () => {
	registerMockAjax("https://maps.googleapis.com/maps/api/js?key=AIzaSyB8Bl9yJHqPve3b9b4KdBo3ISqdlM8RDhs&libraries=places&language=");
	registerMockAjax("https://maps.googleapis.com/maps/api/js?v=3&client=gme-marktplaats&channel=bt_mx&libraries=places&language=");
	registerMockAjax("https://maps.googleapis.com/maps/api/js?key=AIzaSyB8Bl9yJHqPve3b9b4KdBo3ISqdlM8RDhs&libraries=places");
	registerMockAjax("https://maps.googleapis.com/maps/api/js?key=AIzaSyB8Bl9yJHqPve3b9b4KdBo3ISqdlM8RDhs&libraries=places&callback=formMap.configMap");


	window.google = window.google || {};
	window.google.maps = window.google.maps || {};
	window.google.maps.places = window.google.maps.places || {};
	window.google.maps.places.Autocomplete = window.google.maps.places.Autocomplete || function() {}; // no op
	window.google.maps.event = window.google.maps.event || {};
	window.google.maps.event.addListener = window.google.maps.addListener || function() {}; // no op

	window.google = {
		maps: {
			Circle: function() {
				return {
					setMap: function() { }
				};
			},
			Geocoder: function() {
				return {
					geocode: function() {}
				};
			},
			LatLng: function() { },
			Map: function() {
				return {
					fitBounds: function() { },
					getCenter: function() {
						return { 
							lat: function() { 
								return 19.3883633;
							}, 
							lng: function() { 
								return -99.1744249; 
							} 
						};
					 },
					setCenter: function() { },
					setOptions: function() { },
					setZoom: function() { },
					addListener: function() {
						return {
							dragend: function() {}
						};
					},
				};
			},
			addListener: function() {},
			Marker: function() {
				return {
					setMap: function() {}
				};
			},
			places: {
				Autocomplete: function() {
					return {
						bindTo: function() { },
						addListener: function() {
							return;
						},
						getPlace: function() { },
						setBounds: function() { }
					};
				}
			},
			event: {
				addListener: function() {},
				trigger: function() {}
			},
		}
	};
};

let mockWebshim = () => {
	registerMockAjax("/public/js/libraries/webshims/shims/form-core.js", {});
	registerMockAjax("/public/js/libraries/webshims/shims/combos/10.js", {});
	registerMockAjax("/public/js/libraries/webshims/shims/combos/3.js", {});
	registerMockAjax("/public/js/libraries/webshims/shims/combos/17.js", {});
	registerMockAjax("/public/js/libraries/webshims/shims/form-shim-extend.js", {});
};

let objectPropertyMocks = [];

// This should only be used to mock a property defined using getter / setter in class definition.
// It will define a property on the object which will override the definition in prototype.
// And delete this property will recover the property defined in prototype.
let mockObjectProperty = (obj, prop, initValue) => {
	objectPropertyMocks.push({obj: obj, prop: prop });
	Object.defineProperty(obj, prop, { configurable: true, enumerable: false, writable: true, value: initValue });
};

let unmockAllObjectProperties = () => {
	objectPropertyMocks.forEach(mockDefinition => delete mockDefinition.obj[mockDefinition.prop]);
};

let exports = {
	setupTest,
	setupPageTest,
	registerMockAjax,
	setCookie,
	getCookie,
	disableFormWarning,
	mockWebshim,
	mockGoogleLocationApi,
	mockObjectProperty
};

_.extend(exports, simulateInteractionHelpers);
module.exports = exports;

// spying on ajax and replacing with fake, mock function
beforeEach(() => {
	spyOn($, 'ajax').and.callFake((options) => {
		let ajaxInfo = _dequeue(options.url);
		if (!ajaxInfo) {
			throw new Error(`no mocked endpoint for ${options.url}`);
		}
		if (ajaxInfo.options) {
			if (ajaxInfo.options.fail) {
				let err = new Error();
				err.responseText = JSON.stringify(ajaxInfo.returnData);
				err.status = ajaxInfo.options.status || 500;
				options.error(err);
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
			if (options.success) {
				options.success(ajaxInfo.returnData);
			}
		}

	});
});

afterEach(() => {
	$("#testArea").empty();
	$("body").off();
	$(window).off();
	formChangeWarning.disable();
	mockAjaxMapQueue = [];
	unmockAllObjectProperties();
});
