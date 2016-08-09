'use strict';


let express = require('express');
let router = express.Router();

let AppShellModel = require(process.cwd() + '/app/builders/page/AppShellModel');
let pageControllerUtil = require(process.cwd() + '/app/appWeb/controllers/all/PageControllerUtil');


let AppShell = {
	/**
	 * Special footer data for AppShell
	 */
	extendFooterData: (modelData) => {
		// JS
		modelData.footer.javascripts.push(modelData.footer.baseJSMinUrl + "AppShell_mobile_es_MX.js");
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
		AppShell.extendFooterData(modelData);

		pageControllerUtil.postController(req, res, next, 'appshell/views/hbs/appshell_', modelData);

		console.timeEnd('Instrument-AppShell-Controller');
	}).fail((err) => {
		console.error(err);
		console.error(err.stack);
		next(err);
	});
});

module.exports = router;
