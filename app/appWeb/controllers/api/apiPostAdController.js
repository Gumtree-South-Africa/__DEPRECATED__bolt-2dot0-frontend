'use strict';

let express = require('express');
let router = express.Router();

let cwd = process.cwd();
let ModelBuilder = require(process.cwd() + '/app/builders/common/ModelBuilder');
let cors = require(cwd + '/modules/cors');

let editAdErrorParser = require(`${cwd}/app/utils/EditAdErrorParser.js`);
let validator = require('is-my-json-valid');
let schemaPostAd = require(cwd + '/app/appWeb/jsonSchemas/postAdRequest-schema.json');
let UserModel = require(cwd + '/app/builders/common/UserModel.js');
let DraftAdModel = require(cwd + '/app/builders/common/DraftAdModel.js');
let PostAdModel = require(cwd + '/app/builders/common/PostAdModel.js');
let AttributeModel = require(cwd + '/app/builders/common/AttributeModel.js');
let logger = require(`${cwd}/server/utils/logger`);

let VerticalCategoryUtil = require(`${cwd}/app/utils/VerticalCategoryUtil.js`);
let BapiError = require(`${cwd}/server/services/bapi/BapiError.js`);
let Q = require('q');



let getNotLoggedInResponsePromise = (model, machguidCookie, requestJson) => {
	let response = {};

	response.state = 'AD_DEFERRED';

	// get the machguid from cookie to use in draft
	let guid = machguidCookie;

	// store the requestJson ads in backend (deferred ad creation)
	let draftAdModel = new DraftAdModel(model.bapiHeaders);

	return draftAdModel.saveDraft(guid, requestJson).then(() => {
		// the result is unused, it contains the guid we passed in
		// Note: we don't know the user's identity, so it is possible someone could hijack this deferred ad using the guid

		//response.guid = guid;	// client currently checks for success this way <-- response.guid to be deprecated

		response.defferedLink = `/post?guid=${guid}`;

		// TODO Old Login Modal - till login is enabled on 2.0
		let returnUrl = `/post?guid=${guid}`;
		response.links = {
			emailLogin: `/login.html?redirect=${returnUrl}`,
			register: `/register.html?redirect=${returnUrl}`,
			facebookLogin: `/social/facebook/authorize?return=${returnUrl}`
		};
		// End Old Login Modal - till login is enabled on 2.0

		return response;
	});
};

let forceUserToLogin = (model, machguidCookie, requestJson, res) => {
	getNotLoggedInResponsePromise(model, machguidCookie, requestJson).then((response) => {
		res.send(response);
		return;
	}).fail((e) => {
		console.error(`getNotLoggedInResponsePromise failure ${e.message}`);
		res.status(500).send();
		return;
	});
	return;
};

let getAdPostedResponse = (results) => {

	let response = {};
	// extract only what we need for the response, minimal response
	response.state = "AD_CREATED";

	response.ad = {
		id: results.id,
		redirectLinks: results.redirectLinks,
		status: results.adState
	};

	return response;
};

/**
 * route is /api/post/create
 * request schema, see postAdRequest-schema.json
 * expects geo information to have arrived in the request
 *
 * 	returns the following JSON:
 * 	{
 *		state: "AD_CREATED" | "AD_DEFERRED"
 *
 *	AD_DEFERRED case:
 *
 *		links: {
 *			emailLogin: `/login.html?return=${returnUrl}`,
 *			register: `/register.html?return=${returnUrl}`,
 *			facebookLogin: `/social/facebook/authorize?return=${returnUrl}`
 *		}
 *
 *	AD_CREATED case:
 *
 *		ad: {
 *				id: "string",
 *				vipLink: "string"
 *		}
 *	}
 *
 */
router.post('/create', cors, (req, res) => {

	// Step 1: Check if request type sent is JSON
	if (!req.is('application/json')) {
		res.status(406).send();	// we expect only JSON,  406 = "Not Acceptable"
		return;
	}

	// Step 2: Validate the incoming JSON
	let validate = validator(schemaPostAd);
	let valid = validate(req.body);
	if (!valid) {
		//console.error(`schema errors: ${JSON.stringify(validate.errors, null, 4)}`);
		res.contentType = "application/json";
		res.status(400).send({
			schemaErrors: validate.errors
		});
		return;
	}
	// is there any finer granularity of validation needed that schema doesnt take care of?
	// there doesnt appear to be any so far

	// Step 3: Retrieve info from request since we're validated
	let requestJson = req.body;
	let authenticationCookie = req.cookies['bt_auth'];
	let machguidCookie = req.cookies['machguid'];

	// Step 4: Initialize Model
	let modelBuilder = new ModelBuilder();
	let model = modelBuilder.initModelData(res.locals, req.app.locals, req.cookies);
	let postAdModel = new PostAdModel(model.bapiHeaders);
	let userModel = new UserModel(model.bapiHeaders);

	// Step 5: Validate against vertical category
	let ads = requestJson.ads;
	let verticalCategoryValidationPromise;
	if (ads) {
		verticalCategoryValidationPromise =
			Q.all(ads.map(ad => VerticalCategoryUtil.verticalCategoryValidate(
				ad, res.locals.config.categoryAllData,
				res.locals.config.bapiConfigData.content.verticalCategories,
				model.bapiHeaders))).then(errorsArray => {
				let allErrors = [];
				errorsArray.forEach(errors => {
					if (errors && errors.length) {
						allErrors = allErrors.concat(errors);
					}
				});
				if (allErrors && allErrors.length) {
					throw new BapiError('Vertical category validation failed', {
						statusCode: 400,
						bapiJson: {
							statusCode: 400,
							message: "Validation Errors",
							details: allErrors
						}
					});
				}

			});
	} else {
		verticalCategoryValidationPromise = Q.resolve(null);
	}

	var bapiErrorHandler = (error) => {
		let errInfoObj;
		if (error && error.bapiJson) {
			errInfoObj = editAdErrorParser.parseErrors(error.bapiJson.details);
		}
		let bapiInfo = logger.logError(error);
		// post ad has failed
		res.status(error.getStatusCode(500)).send({
			error: "postAd failed, see logs for details",
			bapiJson: bapiInfo,
			bapiValidationFields: errInfoObj
		});
		return;
	};

	verticalCategoryValidationPromise.then(() => {

		// Step 6: Check if user has logged in
		//         If not logged in, save the ad in draft and force user to register / login via bolt / login via facebook
		if (!authenticationCookie) {
			forceUserToLogin(model, machguidCookie, requestJson, res);
			return;
		}


		// Step 7: Validate authentication cookie is still good
		userModel.getUserFromCookie().then( () => {
			// user cookie checks out fine, go ahead and post the ad...


			// Step 8: Post The Ad
			postAdModel.postAd(requestJson).then((adResults) => {
				let responseJson = getAdPostedResponse(adResults);
				res.send(responseJson);
				return;
			}).fail(bapiErrorHandler);

		}).fail((error) => {
			if (error.statusCode && error.statusCode === 404) {
				forceUserToLogin(model, machguidCookie, requestJson, res);
				return;
			}

			// user call has failed
			console.error(`userService.getUserFromCookie failure ${error}`);
			res.status(500).send({
				error: "unable to validate user, see logs for details"
			});
			return;
		});
	}, bapiErrorHandler);

});

router.get('/customattributes/:categoryId', cors, (req, res) => {
	let modelBuilder = new ModelBuilder();
	let model = modelBuilder.initModelData(res.locals, req.app.locals, req.cookies);

	let verticalCategory = VerticalCategoryUtil.getVerticalCategory(
		Number(req.params.categoryId), res.locals.config.categoryAllData,
		res.locals.config.bapiConfigData.content.verticalCategories);

	if (!verticalCategory) {
		return res.json({});  // Only for vertical categories post support customer attributes
	}

	let attributeModel = new AttributeModel(model.bapiHeaders);

	attributeModel.getAllAttributes(req.params.categoryId).then((attributeData) => {
		let processedCustomAttributesList = attributeModel.processCustomAttributesList(attributeData);
		processedCustomAttributesList.verticalCategory = verticalCategory;
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

module.exports = router;
