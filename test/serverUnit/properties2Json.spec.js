/*global describe:false, it:false, beforeEach:false, afterEach:false*/

'use strict';


describe('Properties2Json', function() {

	var Q = require('Q'), input = __dirname + '/mocks/test_te_ST.properties', output = __dirname + 'test/tmp/', fs = require('fs'), Properties2Json = require(process.cwd() + '/scripts/properties2Json.js'), result, file, data, FAIL = new Error('FAILED');

	before(function(done) {
		// TODO : copy test/mocks/test_te_ST.txt > test/mocks/test_te_ST.properties
		result = Properties2Json(input, output, {fix: true});
		result.then(function(value) {
			file = fs.readFileSync(input, 'utf-8').toString();
			data = require(output + 'te_ST/test.json');
			done();
		});
	});
	after(function() {
		// TODO : delete tmp folder
		// TODO : delete test/mocks/test_te_ST.properties
	});
	it('the json file', function() {
		describe('the package', function() {
			it('should return a valid promise', function() {
				if (typeof result.then !== 'function') {
					throw FAIL;
                }
				if (result.constructor !== Q(result).constructor) {
					throw FAIL;
                }
			});
		});
		describe('the DO_NOT_EDIT string', function() {
			it('should exist', function() {
				if (data.DO_NOT_EDIT === undefined) {
					throw FAIL;
                }
			});
			it('should be of type string', function() {
				if (typeof data.DO_NOT_EDIT !== 'string') {
					throw FAIL;
                }
			});
		});
		describe('regular values', function() {
			it('should be stored correctly', function() {
				if (data.test.jeepers != 'success') {
					throw FAIL;
                }
			});
		});
		describe('when handling duplicates', function() {
			it('the key should contain the last value found in the file', function() {
				if (data.test.foo != 'success') {
					throw FAIL;
                }
			});
		});
		describe('when handling invalid child parent assignments', function() {
			it('the parent should be an object', function() {
				if (typeof data.test != 'object') {
					throw FAIL;
                }
			});
			it('the original parent value should be stored @ $$', function() {
				if (data.test['$$'] != 'success') {
					throw FAIL;
                }
			});
			it('nested parents should be an object', function() {
				if (typeof data.test.bar != 'object') {
					throw FAIL;
                }
			});
			it('the original nested parent value should be stored @ $$', function() {
				if (data.test.bar['$$'] != 'success') {
					throw FAIL;
                }
			});
			it('children should be stored correctly', function() {
				if (data.test.bar.another != 'success') {
					throw FAIL;
                }
			});
		});
		describe('regarding white space', function() {
			it('it should be removed from all keys', function() {
				if (typeof data.test['spaces     '] == 'string') {
					throw FAIL;
                }
				if (typeof data.test['spaces'] != 'string') {
					throw FAIL;
                }
			});
			it('values should be trimmed', function() {
				if (data.test['spaces'] != data.test['spaces'].trim()) {
					throw FAIL;
                }
			});
		});
		describe('the result file', function() {
			it('should retain comments', function() {
				if (file.indexOf('#foo') != 42) {
					throw FAIL;
                }
			});
			it('should not contain duplicates', function() {
				var start = 0, count = 0;
				while ((start = file.indexOf('test.duplicate', start + 1)) > 0) {
					count++;
				}
				if (count > 1) {
					throw FAIL;
                }
			});
			it('duplicates should merge to the last value in the file', function() {
				if (file.indexOf('test.duplicate=success') === -1) {
					throw FAIL;
                }
				if (file.indexOf('test.duplicate=failure') !== -1) {
					throw FAIL;
                }
			});
			it('invalid parents should be reassigned to .$$', function() {
				if (file.indexOf('test.$$=success') === -1) {
					throw FAIL;
                }
				if (file.indexOf('test=success') !== -1) {
					throw FAIL;
                }
			});
			it('nested invalid parents should be reassigned to .$$', function() {
				if (file.indexOf('test.bar.$$=success') === -1) {
					throw FAIL;
                }
				if (file.indexOf('test.bar=success') !== -1) {
					throw FAIL;
                }
			});
		});
	});
});
