'use strict';

let express = require('express');
let router = express.Router();
let cwd = process.cwd();
let cors = require(cwd + '/modules/cors');
let ModelBuilder = require(cwd + '/app/builders/common/ModelBuilder');
let FeatureModel = require(cwd + '/app/builders/common/FeatureModel');

// route is /api/promotead/features
router.get('/features', cors, (req, res, next) => {
	let categoryId = req.query.categoryId;
	let locationId = req.query.locationId;
	let adId = req.query.adId;

	let modelBuilder = new ModelBuilder();
	let model = modelBuilder.initModelData(res.locals, req.app.locals, req.cookies);
	model.FeatureModel = new FeatureModel(model.bapiHeaders);
	model.FeatureModel.getAvailableFeatures(categoryId, locationId, adId).then((modelData) => {
		modelData.forEach((feature) => {
			feature.featureOptions.forEach((option) => {
				feature.name = option.featureTypeFieldName;
				option.fieldValue = adId + "|" + option.fieldValue;
			});
		});
		res.status(200).send(modelData);
		return;
	}).fail((err) => {
		console.error(err);
		console.error(err.stack);
		//Throw a 404 page for 404 or 401 (unauthorized). otherwise 500
		return (err.statusCode === 404 || err.statusCode === 400 || err.statusCode === 401) ? next() : next(err);
	});
});

module.exports = router;
