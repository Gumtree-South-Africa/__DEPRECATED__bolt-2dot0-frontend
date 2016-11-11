'use strict';
let cwd = process.cwd();
let specHelper = require('../helpers/specHelper');
let AbstractPageModel = require(`${cwd}/app/builders/common/AbstractPageModel`);

describe('Page Models', () => {
	describe('Abstract Page Models', () => {
		let req = {
			app: {
				locals: {
					useragent: ''
				}
			},
			cookies: {
				"bt_auth": 'adsf'
			}
		};
		let res = {
			locals: {
				b2dot0Version: true,
				b2dot0PageVersion: true,
				config: {
					bapiConfigData: {}
				}
			},
			secure: true,
		};
		it('should print an error if ZK has extra functions', (done) => {
			let abstractPageModel = new AbstractPageModel(req, res);
			let config = specHelper.getMockDataByLocale('/server/config/bapi/', 'config', 'es_MX');
			let homePageConfig = config.bapi.HomepageV2.desktop.models;
			let errorStrings = homePageConfig.map((entry) => {
				return `Function: ${entry} found in ZK config but not implemented in model`;
			});
			spyOn(abstractPageModel, 'logConfigError').and.callFake((string) => {
				errorStrings.splice(errorStrings.indexOf(string), 1);
			});
			abstractPageModel.getArrFunctionPromises(req, res, {}, homePageConfig);
			expect(errorStrings.length).toBe(0);
			done();
		});

		it('should print an error if ZK has extra functions', (done) => {
			let abstractPageModel = new AbstractPageModel(req, res);
			let config = specHelper.getMockDataByLocale('/server/config/bapi/', 'config', 'es_MX');
			let homePageConfig = config.bapi.HomepageV2.desktop.models;
			let errorStringsZk = homePageConfig.map((entry) => {
				return `Function: ${entry} found in ZK config but not implemented in model`;
			});
			let errorStringsModel = homePageConfig.map((entry) => {
				return `Function: ${entry} implemented in model but not found in ZK config, function will not be executed.`;
			});
			spyOn(abstractPageModel, 'logConfigError').and.callFake((string) => {
				errorStringsZk.splice(errorStringsZk.indexOf(string), 1);
				errorStringsModel.splice(errorStringsModel.indexOf(string), 1);
			});

			let functionMap = {};
			functionMap[homePageConfig[0]] = () => { };
			functionMap[homePageConfig[1]] = () => { };
			functionMap[homePageConfig[2]] = () => { };

			abstractPageModel.getArrFunctionPromises(req, res, functionMap, homePageConfig);

			expect(errorStringsZk.length).toBe(3);
			expect(errorStringsModel.length).toBe(3);
			//make sure that the error strings are correct for the right zk config
			expect(errorStringsZk[0].indexOf(homePageConfig[0])).not.toBe(-1);
			expect(errorStringsZk[1].indexOf(homePageConfig[1])).not.toBe(-1);
			expect(errorStringsZk[2].indexOf(homePageConfig[2])).not.toBe(-1);

			expect(errorStringsModel[0].indexOf(homePageConfig[0])).not.toBe(-1);
			expect(errorStringsModel[1].indexOf(homePageConfig[1])).not.toBe(-1);
			expect(errorStringsModel[2].indexOf(homePageConfig[2])).not.toBe(-1);
			done();
		});
	});
});
