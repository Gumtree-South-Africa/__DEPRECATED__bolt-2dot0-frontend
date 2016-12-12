'use strict';

let express = require('express');
let router = express.Router();
let validator = require('is-my-json-valid');

let cwd = process.cwd();
let replySchema = require(cwd + '/app/appWeb/jsonSchemas/replyRequest-schema.json');
let AdvertModel = require(cwd + '/app/builders/common/AdvertModel');
let ModelBuilder = require(cwd + '/app/builders/common/ModelBuilder');
let cors = require(cwd + '/modules/cors');
let logger = require(`${cwd}/server/utils/logger`);


// route is /api/ads/reply
router.post('/', cors, (req, res) => {
	// Validate the incoming JSON
	let validate = validator(replySchema);
	let valid = validate(req.body);
	if (!valid) {
		res.contentType = "application/json";
		res.status(400).send({
			schemaErrors: validate.errors
		});
		return;
	}

	// Validate the body
	if (req.body.adId && req.body.replyMessage) {
		let replyForm = {
			machineId: req.app.locals.machineid || '',
			adId: req.body.adId,
			buyerName: req.body.buyerName,
			email: req.body.email,
			phoneNumber: req.body.phoneNumber || '',
			replyMessage: req.body.replyMessage,
			isSendMeCopyEmail: req.body.isSendMeCopyEmail || false
		};

		replyForm.seoUrl = req.body.seoUrl;

		let modelBuilder = new ModelBuilder();
		let model = modelBuilder.initModelData(res.locals, req.app.locals, req.cookies);
		model.advertModel = new AdvertModel(model.bapiHeaders);
		model.advertModel.replyToTheAd(replyForm).then(() => {
			res.status(301).redirect(replyForm.seoUrl + '/?adActivateStatus=AdReplySuccess'); //redirect with appended URL
		}).fail((err) => {
			let bapiInfo = logger.logError(err);
			res.status(err.getStatusCode(500)).send({// 500 default status code
				error: "unable to reply to ad, see logs for details",
				bapiInfo: bapiInfo
			});
		});
	} else {
		res.status(400).send({
			error: "adId not found in the request"
		});
	}
});


module.exports = router;