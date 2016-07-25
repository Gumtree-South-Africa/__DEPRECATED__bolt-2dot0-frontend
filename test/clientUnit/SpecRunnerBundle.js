/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ({

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	// insert test area into the page for use by jasmine

	$('body').append('<div id="testArea"></div>');

	__webpack_require__(32);

/***/ },

/***/ 32:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var sampleComponent = __webpack_require__(33);
	var specHelper = __webpack_require__(34);

	describe('Sample Component', function () {
		it('should change text on click', function () {
			var $testArea = specHelper.prepareTemplate('SampleTemplate', {}),
			    $sampleComponent = $testArea.find('#sampleComponent');

			specHelper.registerMockAjax('/api/displayIndex', { displayIndex: 1 });

			sampleComponent.initialize();

			expect($sampleComponent.attr('data-display-index')).toEqual('0');

			$testArea.find('button').click();

			expect($sampleComponent.attr('data-display-index')).toEqual('1', 'Display Index Should Be Updated on Button Click');
		});
	});

/***/ },

/***/ 33:
/***/ function(module, exports) {

	'use strict';

	var sampleTemplate = '<div id="sampleComponent" data-display-index="0">' + '<button></button>' + '</div>';

	if (Handlebars.templates === undefined) {
		Handlebars.templates = {};
	}

	Handlebars.templates['SampleTemplate'] = Handlebars.compile(sampleTemplate);

	/**
	 * initialize sets up initial events on the component
	 */
	module.exports.initialize = function () {
		var $myView = $('#sampleComponent');
		$myView.find('button').click(function () {
			var ajaxOptions = {
				method: 'GET',
				url: '/api/displayIndex',
				success: function success(data) {
					$myView.attr('data-display-index', data.displayIndex);
				}
			};

			$.ajax(ajaxOptions);
		});
	};

/***/ },

/***/ 34:
/***/ function(module, exports) {

	'use strict';

	var mockAjaxMapQueue = {};

	/**
	 * enqueue to mockAjaxMapQueue by url
	 * @param {string} url - url endpoint that will be queued
	 * @param {object} returnData - returnData to return on dequeue
	 */
	var enqueue = function enqueue(url, returnData) {
		if (mockAjaxMapQueue.hasOwnProperty(url) && Array.isArray(mockAjaxMapQueue[url])) {
			mockAjaxMapQueue[url].push(returnData);
		} else if (!mockAjaxMapQueue.hasOwnProperty(url)) {
			mockAjaxMapQueue[url] = [returnData];
		}
	};

	/**
	 * dequeue item from mockAjaxMapQueue by url
	 * @param {string} url - url endpoint to get data from
	 * @returns {object} - mocked data
	 */
	var dequeue = function dequeue(url) {
		if (!mockAjaxMapQueue.hasOwnProperty(url) || !Array.isArray(mockAjaxMapQueue[url])) {
			throw Error('No Registered Mock Ajax for url -> ' + url);
		}

		var returnData = mockAjaxMapQueue[url].shift();
		if (mockAjaxMapQueue[url].length <= 0) {
			delete mockAjaxMapQueue[url];
		}

		return returnData;
	};

	/**
	 * Given url and return data, store the mock for use later
	 * @param {string} url - url to mock
	 * @param {object} returnData - data to be returned from mocked ajax request
	 */
	module.exports.registerMockAjax = function (url, returnData) {
		enqueue(url, returnData);
	};

	/**
	 * Prepare client template and return that DOM after appending to the screen
	 * @param {string} templateName - key for template to render
	 * @param {object} templateModel - model to use in template render
	 * @returns {jQuery} return testArea
	 */
	module.exports.prepareTemplate = function (templateName, templateModel) {
		var template = Handlebars.templates[templateName];

		if (!template) {
			throw Error('No precompiled template with the name -> ' + templateName);
		}

		var dom = template(templateModel);

		return $('#testArea').append(dom);
	};

	// spying on ajax and replacing with fake, mock function
	beforeEach(function () {
		spyOn($, 'ajax').and.callFake(function (options) {
			var data = dequeue(options.url);
			options.success(data);
		});
	});

/***/ }

/******/ });