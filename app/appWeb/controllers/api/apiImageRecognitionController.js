'use strict';

let express = require('express');
let router = express.Router();
let cwd = process.cwd();
let ImageRecognitionModel = require(cwd + '/app/builders/common/ImageRecognitionModel');
let cors = require(cwd + '/modules/cors');
let logger = require(`${cwd}/server/utils/logger`);
let ModelBuilder = require(cwd + '/app/builders/common/ModelBuilder');

// route is /api/postad/imagerecognition
router.post('/', cors, (req, res) => {
	let imageUrl = req.body.url;
	let modelBuilder = new ModelBuilder();
	let model = modelBuilder.initModelData(res.locals, req.app.locals, req.cookies);
	model.ImageRecognitionModel = new ImageRecognitionModel(model.bapiHeaders);

	model.ImageRecognitionModel.recognizeCategoryFromImage(imageUrl).then((result) => {
		res.status(200).send({categoryId: result.suggestion.categoryId});
		return;
	}).fail((err) => {
		console.error("[API Image recognition] Did not recognize a category for the image, set default to Hogar !");
		logger.logError(err);
		res.status(200).send({categoryId: "1"}); // If category recognition fail, return default Hogar category
		return;
	});

});

module.exports = router;
