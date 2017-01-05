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
		console.warn('ValidationError: Reply to Ad:', req.body.seoUrl);
		res.status(301).redirect(req.body.seoUrl + '?replyStatus=validationError'); //redirect with appended URL
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
			seoUrl: req.body.seoUrl,
			hostname: res.locals.config.hostname,
			basedomainsuffix: res.locals.config.baseDomainSuffix
		};
		/*
		* Since we call rui reply, follow it's convention,
		* only set isSendMeCopyEmail when isSendMeCopyEmail is checked.
		 */
		if (req.body.isSendMeCopyEmail) {
			replyForm.isSendMeCopyEmail = req.body.isSendMeCopyEmail;
		}

		let modelBuilder = new ModelBuilder();
		let model = modelBuilder.initModelData(res.locals, req.app.locals, req.cookies);
		model.advertModel = new AdvertModel(model.bapiHeaders);
		model.advertModel.replyToTheAd(replyForm).then(() => {
			res.status(301).redirect(replyForm.seoUrl + '?adActivateStatus=AdReplySuccess'); //redirect with appended URL
			return;
		}).fail((err) => {
			let bapiInfo = logger.logError(err);
			console.warn('ServerError: Reply to Ad:', req.body.seoUrl);
			console.warn(bapiInfo);
			res.status(301).redirect(replyForm.seoUrl + '?replyStatus=serverError'); //redirect with appended URL
			return;
		});
	} else {
		console.warn('MissingFieldsError: Reply to Ad:', req.body.seoUrl);
		res.status(301).redirect(req.body.seoUrl + '?replyStatus=validationError'); //redirect with appended URL
		return;
	}
});


module.exports = router;
