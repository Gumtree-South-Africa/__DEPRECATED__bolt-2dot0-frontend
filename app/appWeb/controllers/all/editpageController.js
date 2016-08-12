'use strict';

let express = require('express');
let router = express.Router();
let cwd = process.cwd();
let pageControllerUtil = require(cwd + '/app/appWeb/controllers/all/PageControllerUtil');
let EditAdPageModel = require(cwd + '/app/builders/page/EditAdPageModel');
let EditAdModel = require(cwd + '/app/builders/common/EditAdModel.js');
let EpsModel = require(cwd + '/app/builders/common/EpsModel');
let ModelBuilder = require(process.cwd() + '/app/builders/common/ModelBuilder');

let EditAdPage = {
	extendModelData: (req, modelData) => {
		// CSS
		if (modelData.header.min) {
			modelData.header.containerCSS.push(modelData.header.localeCSSPath + '/EditAdPage.min.css');
		} else {
			modelData.header.containerCSS.push(modelData.header.localeCSSPath + '/EditAdPage.css');
		}
		modelData.footer.javascripts.push(modelData.footer.baseJSMinUrl + "EditAd_desktop_es_MX.js");
	}
};

router.use('/:id?', (req, res, next) => {
	let adId = req.params.id;

	let modelBuilder = new ModelBuilder();
	let model = modelBuilder.initModelData(res.locals.config, req.app.locals, req.cookies);
	let editAdModel = new EditAdModel(model.bapiHeaders);

	let editAdPageModel = new EditAdPageModel(req, res);
	let modelPromise = editAdPageModel.populateData();

	modelPromise.then((modelData) => {
		EditAdPage.extendModelData(req, modelData);
		modelData.adId = adId;

		modelData.header.distractionFree = false;
		modelData.footer.distractionFree = false;
		modelData.eps = EpsModel();

		editAdModel.getAd(adId).then((getAdResults) => {
			modelData.getAdResults = getAdResults;

			pageControllerUtil.postController(req, res, next, 'editAd/views/hbs/editAd_', modelData);
		}).fail((getError) => {
			// Just throw a 404 instead of a 500 for a missing ad.
			return (getError.statusCode === 404) ? next() : next(getError);
		});
	}).fail((err) => {
		//TODO: 401 back BAPI should redirect to 404 (user doesn't own this ad)
		console.error(err);
		console.error(err.stack);
		next(err);
	});
});

module.exports = router;
