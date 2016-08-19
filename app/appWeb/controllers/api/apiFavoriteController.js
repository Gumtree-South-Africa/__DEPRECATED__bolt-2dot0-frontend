'use strict';

let express = require('express');
let router = express.Router();

let AdvertModel = require(process.cwd() + '/app/builders/common/AdvertModel');
let ModelBuilder = require(process.cwd() + '/app/builders/common/ModelBuilder');
let cors = require(process.cwd() + '/modules/cors');

// route is /api/ads/favorite
router.post('/', cors, (req, res) => {
	let modelBuilder = new ModelBuilder();

	let model = modelBuilder.initModelData(res.locals.config, req.app.locals, req.cookies);
	model.advertModel = new AdvertModel(model.bapiHeaders);

	model.advertModel.favoriteTheAd(req.body.adId).then(() => {
		res.status(200);
		res.send();
	}).fail((err) => {
		console.error(err);
		console.error(err.stack);
		res.status(500);
		res.send({
			error: true
		});
	});
});

router.delete('/', cors, (req, res) => {
	let modelBuilder = new ModelBuilder();

	let model = modelBuilder.initModelData(res.locals.config, req.app.locals, req.cookies);
	model.advertModel = new AdvertModel(model.bapiHeaders);

	model.advertModel.unfavoriteTheAd(req.body.adId).then(() => {
		res.status(200);
		res.send();
	}).fail((err) => {
		console.error(err);
		console.error(err.stack);
		res.status(500);
		res.send({
			error: true
		});
	});
});

module.exports = router;
