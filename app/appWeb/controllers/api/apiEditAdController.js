'use strict';

let express = require('express');
let router = express.Router();

let cwd = process.cwd();
let ModelBuilder = require(process.cwd() + '/app/builders/common/ModelBuilder');
let cors = require(cwd + '/modules/cors');

let validator = require('is-my-json-valid');
let schemaPostAd = require(cwd + '/app/appWeb/jsonSchemas/editAdRequest-schema.json');
let UserModel = require(cwd + '/app/builders/common/UserModel.js');
let EditAdModel = require(cwd + '/app/builders/common/EditAdModel.js');
let AttributeModel = require(cwd + '/app/builders/common/AttributeModel.js');

router.post('/attributedependencies', cors, (req, res) => {
	let modelBuilder = new ModelBuilder();
	let model = modelBuilder.initModelData(res.locals.config, req.app.locals, req.cookies);
	let attributeModel = new AttributeModel(model.bapiHeaders);

	attributeModel.getAttributeDependents(req.body.catId, req.body.depAttr, req.body.depValue).then((attributes) => {
		res.json(attributes);
	}).fail((err) => {
		console.warn(`getAttributeDependents failed for categoryId: ${req.body.catId}, attributeName: ${req.body.depAttr}, error: ${err}`);
		return res.status(500).json({
			error: "attributesdependencies failed"
		});
	});
});

router.get('/customattributes/:categoryId', cors, (req, res) => {
	let modelBuilder = new ModelBuilder();
	let model = modelBuilder.initModelData(res.locals.config, req.app.locals, req.cookies);
	let attributeModel = new AttributeModel(model.bapiHeaders);

	attributeModel.getAllAttributes(req.params.categoryId).then((attributeData) => {
		res.json(attributeModel.processCustomAttributesList(attributeData));
	}).fail((err) => {
		console.warn('getAllAttributes failed for categoryId: ' + req.params.categoryId + `, error: ${err}`);
		return res.status(500).json({
			error: "customattributes failed"
		});
	});
});

router.post('/update', cors, (req, res) => {
	// Step 1: Check if request type sent is JSON
	if (!req.is('application/json')) {
		return res.status(406).send();	// we expect only JSON,  406 = "Not Acceptable"
	}

	// Step 2: Validate the incoming JSON
	let validate = validator(schemaPostAd);
	let valid = validate(req.body);
	if (!valid) {
		console.error(`schema errors: ${JSON.stringify(validate.errors, null, 4)}`);
		res.contentType = "application/json";
		return res.status(400).json({
			schemaErrors: validate.errors
		});
	}

	// Step 3: Retrieve info from request since we're validated
	let requestJson = req.body;
	let authenticationCookie = req.cookies['bt_auth'];

	let modelBuilder = new ModelBuilder();
	let model = modelBuilder.initModelData(res.locals.config, req.app.locals, req.cookies);
	let editAdModel = new EditAdModel(model.bapiHeaders);
	let userModel = new UserModel(model.bapiHeaders);
	// Validate user has a cookie set
	if (!authenticationCookie) {
		console.error('User attempted to edit an ad without cookie set');
		return res.status(500).json({
			error: "Edit ad failed, user not logged in"
		});
	}

	userModel.getUserFromCookie().then(() => {
		return editAdModel.editAd(requestJson);
	}).then((result) => {
		res.contentType = "application/json";
		res.status(200).json(result);
	}).fail((error) => {
		let returnCode = 500;
		let returnMessage = (error.data) ? error.data.message : 'Edit ad failed';
		console.error('Edit ad failed ' + error);
		console.error(error.data);
		if (error.statusCode) {
			//Special error cases need to be handled differently
			switch (error.statusCode) {
				case 404:
					returnCode = 500;
					console.error('User attempted to edit an ad with invalid cookie');
					returnMessage = "Edit ad failed, user not valid";
					break;
				case 401:
					returnCode = 401;
					console.error('User attempted to edit an ad they did not own');
					returnMessage = error.data.message || "Edit ad failed, user does not own this ad.";
					break;
				default:
					break;
			}
		}
		res.status(returnCode).json({
			error: returnMessage
		});
	});
});


module.exports = router;
