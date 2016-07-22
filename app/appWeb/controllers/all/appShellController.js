'use strict';


let express = require('express');
let router = express.Router();

let AppShellModel = require(process.cwd() + '/app/builders/page/AppShellModel');
let pageControllerUtil = require(process.cwd() + '/app/appWeb/controllers/all/PageControllerUtil');


let AppShell = {
	/**
	 * Special header data for AppShell
	 */
	extendHeaderData: (modelData) => {
		// CSS
		modelData.header.pageCSSUrl = modelData.header.baseCSSUrl + 'AppShell.css';
		if (modelData.header.min) {
			modelData.header.containerCSS.push(modelData.header.localeCSSPath + '/AppShell.min.css');
		} else {
			modelData.header.containerCSS.push(modelData.header.localeCSSPath + '/AppShell.css');
		}
	},

	/**
	 * Special footer data for AppShell
	 */
	extendFooterData: (modelData) => {
		// JS
		modelData.footer.javascripts.push(modelData.footer.baseJSMinUrl + "appshellBundle.js");
	}
};

/**
 * Build App Shell Model for Service workers to use
 */
router.get('/', (req, res, next) => {
	console.time('Instrument-AppShell-Controller');

	let appShell = new AppShellModel(req, res);
	let modelPromise = appShell.populateData();

	modelPromise.then((modelData) => {
		AppShell.extendHeaderData(modelData);
		AppShell.extendFooterData(modelData);

		pageControllerUtil.postController(req, res, next, 'appshell/views/hbs/appshell_', modelData);

	}).fail((err) => {
		console.error(err);
		console.error(err.stack);
		next(err);
	});

	console.timeEnd('Instrument-AppShell-Controller');
});

module.exports = router;
