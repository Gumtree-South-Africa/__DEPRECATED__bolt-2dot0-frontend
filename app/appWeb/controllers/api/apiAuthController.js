'use strict';

let express = require('express');
let router = express.Router();
let validator = require('is-my-json-valid');

let cwd = process.cwd();
let loginSchema = require(cwd + '/app/appWeb/jsonSchemas/loginRequest-schema.json');
let registerSchema = require(cwd + '/app/appWeb/jsonSchemas/registerRequest-schema.json');
let ModelBuilder = require(process.cwd() + '/app/builders/common/ModelBuilder');
let AuthModel = require(cwd + '/app/builders/common/AuthModel');
let cors = require(cwd + '/modules/cors');
let logger = require(`${cwd}/server/utils/logger`);

// route is /api/auth/login
router.post('/login', cors, (req, res) => {

	if (!req.is('application/json')) {
		return res.status(406).send();	// we expect only JSON,  406 = "Not Acceptable"
	}

	// Validate the incoming JSON
	/* Reference this regex from RUI we are using "as-is", see usage in appWeb/jsonSchemas/login and register
	 String EMAIL_STR = "(([A-Za-z0-9-]+_+)|" +
	 "([A-Za-z0-9-]+\\-+)|" +
	 "([A-Za-z0-9-]+\\.+)|" +
	 "([A-Za-z0-9-]+\\++))*" +
	 "[A-Za-z0-9-_]+@" +
	 "((\\w+\\-+)|(\\w+\\.))*" +
	 "\\w{1,63}\\.[a-zA-Z]{2,6}";
	 */

	let validate = validator(loginSchema);
	let valid = validate(req.body);
	if (!valid) {
		//console.error(`schema errors: ${JSON.stringify(validate.errors, null, 4)}`);
		res.contentType = "application/json";
		res.status(400).send({
			schemaErrors: validate.errors
		});
		return;
	}

	let modelBuilder = new ModelBuilder();
	let model = modelBuilder.initModelData(res.locals, req.app.locals, req.cookies);

	model.authModel = new AuthModel(model.bapiHeaders);
	model.authModel.loginViaBolt(req.body).then((result) => {

		if (!result.accessToken) {
			console.error(`bapi loginViaBolt did not return access token, returning status 500`);
			res.status(500).send({ error: 'missing access token' });
			return;
		}
		// not setting expires or age so it will be a "session" cookie
		res.cookie('bt_auth', result.accessToken, { httpOnly: true });

		res.status(200).send({});	// returning {} since consumer will expect json
		return;
	}).fail((err) => {
		let bapiInfo = logger.logError(err);
		res.status(err.getStatusCode(500)).send({// 500 default status code
			error: "unable to login, see logs for details",
			bapiInfo: bapiInfo
		});
		return;
	});

});

// route is /api/auth/register
router.post('/register', cors, (req, res) => {

	if (!req.is('application/json')) {
		return res.status(406).send();	// we expect only JSON,  406 = "Not Acceptable"
	}

	// Validate the incoming JSON
	let validate = validator(registerSchema);
	let valid = validate(req.body);
	if (!valid) {
		//console.error(`schema errors: ${JSON.stringify(validate.errors, null, 4)}`);
		res.contentType = "application/json";
		res.status(400).send({
			schemaErrors: validate.errors
		});
		return;
	}

	let modelBuilder = new ModelBuilder();
	let model = modelBuilder.initModelData(res.locals, req.app.locals, req.cookies);

	model.authModel = new AuthModel(model.bapiHeaders);
	model.authModel.register(req.body).then((result) => {

		// activation code
		if (!result.activationCode) {
			console.error(`bapi register did not return activation code, returning status 500`);
			res.status(500).send('missing activation code');
			return;
		}
		// ex: "/users/abc@yahoo.com/actions/activate?activationCode=xyz"
		//let activationLink = result._links[0].href;	// there is only one, so we don't need to search for "activationUrl";

		res.status(200).send({});	// returning {} since consumer will expect json
		return;
	}).fail((err) => {
		let bapiInfo = err.logError();
		res.status(err.getStatusCode(500)).send({// 500 default status code
			error: "unable to register, see logs for details",
			bapiInfo: bapiInfo
		});
		return;
	});

});

// route is /api/auth/activate
router.get('/activate', cors, (req, res) => {

	// validate the inputs
	if (!req.query.activationcode) {
		res.status(400);
		res.send({error: "query param missing"});
		return;
	}

	let modelBuilder = new ModelBuilder();
	let model = modelBuilder.initModelData(res.locals, req.app.locals, req.cookies);

	model.authModel = new AuthModel(model.bapiHeaders);
	model.authModel.activate(req.query.activationCode).then((result) => {

		if (!result.accessToken) {
			console.error(`bapi activate did not return access token, returning status 500`);
			res.status(500).send({ error: 'missing access token' });
			return;
		}
		// not setting expires or age so it will be a "session" cookie
		res.cookie('bt_auth', result.accessToken, { httpOnly: true });
		res.status(200).send({});	// returning {} since consumer will expect json

	}).fail((err) => {
		let bapiInfo = err.logError();
		res.status(err.getStatusCode(500)).send({// 500 default status code
			error: "unable to activate, see logs for details",
			bapiInfo: bapiInfo
		});
		return;
	});
});


module.exports = router;

