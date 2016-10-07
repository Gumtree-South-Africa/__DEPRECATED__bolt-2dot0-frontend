'use strict';

let express = require('express');
let router = express.Router();

let PushNotificationModel = require(process.cwd() + '/app/builders/common/PushNotificationModel');
let ModelBuilder = require(process.cwd() + '/app/builders/common/ModelBuilder');
let cors = require(process.cwd() + '/modules/cors');

// route is /api/push/subscribe
router.post('/subscribe', cors, (req, res) => {
	if (typeof req.cookies['bt_auth'] === 'undefined') {
		res.status(401).send({
			error: true
		});
	}

	let modelBuilder = new ModelBuilder();

	let model = modelBuilder.initModelData(res.locals, req.app.locals, req.cookies);
	model.pushNotificationModel = new PushNotificationModel(model.bapiHeaders);

	model.pushNotificationModel.subscribe(req.body.endpoint).then((subscribeResults) => {
		let results = {};

		if (typeof subscribeResults !== 'undefined') {
			results = subscribeResults;
		}

		res.send(results);
	}).fail((err) => {
		console.error(err);
		console.error(err.stack);
		res.status(500).send({
			error: true
		});
	});
});

router.delete('/subscribe', cors, (req, res) => {
	if (typeof req.cookies['bt_auth'] === 'undefined') {
		res.status(401).send({
			error: true
		});
	}

	let modelBuilder = new ModelBuilder();

	let model = modelBuilder.initModelData(res.locals, req.app.locals, req.cookies);
	model.pushNotificationModel = new PushNotificationModel(model.bapiHeaders);

	model.pushNotificationModel.unsubscribe(req.body.endpoint).then((unsubscribeResults) => {
		let results = {};

		if (typeof unsubscribeResults !== 'undefined') {
			results = unsubscribeResults;
		}

		res.send(results);
	}).fail((err) => {
		console.error(err);
		console.error(err.stack);
		res.status(500).send({
			error: true
		});
	});
});

module.exports = router;
