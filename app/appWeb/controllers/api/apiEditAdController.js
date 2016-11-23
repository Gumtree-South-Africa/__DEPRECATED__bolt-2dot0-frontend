'use strict';

let express = require('express');
let router = express.Router();

let cwd = process.cwd();
let ModelBuilder = require(process.cwd() + '/app/builders/common/ModelBuilder');
let cors = require(cwd + '/modules/cors');

let editAdErrorParser = require(`${cwd}/app/utils/EditAdErrorParser.js`);
let validator = require('is-my-json-valid');
let schemaEditAd = require(cwd + '/app/appWeb/jsonSchemas/editAdRequest-schema.json');
let UserModel = require(cwd + '/app/builders/common/UserModel.js');
let EditAdModel = require(cwd + '/app/builders/common/EditAdModel.js');
let AttributeModel = require(cwd + '/app/builders/common/AttributeModel.js');
let logger = require(`${cwd}/server/utils/logger`);
let VerticalCategoryUtil = require(`${cwd}/app/utils/VerticalCategoryUtil.js`);
let BapiError = require(`${cwd}/server/services/bapi/BapiError.js`);

router.post('/attributedependencies', cors, (req, res) => {
	let modelBuilder = new ModelBuilder();
	let model = modelBuilder.initModelData(res.locals, req.app.locals, req.cookies);
	let attributeModel = new AttributeModel(model.bapiHeaders);

	attributeModel.getAttributeDependents(req.body.catId, req.body.depAttr, req.body.depValue).then((attributes) => {
		res.json(attributes);
	}).fail((err) => {
		let bapiJson = logger.logError(err);
		console.warn(`getAttributeDependents failed for categoryId: ${req.body.catId}, attributeName: ${req.body.depAttr}, error: ${err}`);
		return res.status(err.getStatusCode(500)).json({
			error: "attributesdependencies failed",
			bapiJson: bapiJson
		});
	});
});

router.get('/customattributes/:categoryId', cors, (req, res) => {
	let modelBuilder = new ModelBuilder();
	let model = modelBuilder.initModelData(res.locals, req.app.locals, req.cookies);
	let attributeModel = new AttributeModel(model.bapiHeaders);

	let verticalCategory = VerticalCategoryUtil.getVerticalCategory(
		Number(req.params.categoryId), res.locals.config.categoryAllData,
		res.locals.config.bapiConfigData.content.verticalCategories);

	attributeModel.getAllAttributes(req.params.categoryId).then((attributeData) => {
		let processedCustomAttributesList = attributeModel.processCustomAttributesList(attributeData);
		if (verticalCategory) {
			processedCustomAttributesList.verticalCategory = verticalCategory;
		}
		res.json(processedCustomAttributesList);
	}).fail((err) => {
		let bapiJson = logger.logError(err);
		console.warn('getAllAttributes failed for categoryId: ' + req.params.categoryId + `, error: ${err}`);
		return res.status(err.getStatusCode(500)).json({
			error: "customattributes failed",
			bapiJson: bapiJson
		});
	});
});

router.post('/update', cors, (req, res) => {
	// Step 1: Validate user has an authentication cookie set
	let authenticationCookie = req.cookies['bt_auth'];
	if (!authenticationCookie) {
		console.error('User attempted to edit an ad without cookie set');
		return res.status(500).json({
			error: "Edit ad failed, user not logged in"
		});
	}

	// Step 2: Check if request type sent is JSON
	if (!req.is('application/json')) {
		return res.status(406).send();	// we expect only JSON,  406 = "Not Acceptable"
	}

	// Step 3: Validate the incoming JSON
	let validate = validator(schemaEditAd);
	let valid = validate(req.body);
	if (!valid) {
		console.error(`schema errors: ${JSON.stringify(validate.errors, null, 4)}`);
		res.contentType = "application/json";
		return res.status(400).json({
			schemaErrors: validate.errors
		});
	}

	// Step 4: Retrieve info from request since we're validated
	let modelBuilder = new ModelBuilder();
	let model = modelBuilder.initModelData(res.locals, req.app.locals, req.cookies);
	let editAdModel = new EditAdModel(model.bapiHeaders, req.app.locals.prodEpsMode);
	let userModel = new UserModel(model.bapiHeaders);

	let requestJson = req.body;
	userModel.getUserFromCookie().then(() => {
		// Step 5: Validate against vertical category
		return VerticalCategoryUtil.verticalCategoryValidate(
			requestJson, res.locals.config.categoryAllData,
			res.locals.config.bapiConfigData.content.verticalCategories,
			model.bapiHeaders).then(errors => {
			if (errors && errors.length) {
				throw new BapiError('Vertical category validation failed', {
					statusCode: 400,
					bapiJson: {
						statusCode: 400,
						message: "Validation Errors",
						details: errors
					}
				});
			}
		});
	}).then(() => {
		// Step 6: Update Ad
		return editAdModel.editAd(requestJson);
	}).then((result) => {
		res.contentType = "application/json";
		res.status(200).json(result);
	}).fail((error) => {
		let errInfoObj;
		if (error && error.bapiJson) {
			errInfoObj = editAdErrorParser.parseErrors(error.bapiJson.details);
		}
		let bapiJson = logger.logError(error);
		res.status(error.getStatusCode(500)).json({
			error: "error updating ad, see logs for details",
			bapiJson: bapiJson,
			bapiValidationFields: errInfoObj
		});
	});
});


module.exports = router;
