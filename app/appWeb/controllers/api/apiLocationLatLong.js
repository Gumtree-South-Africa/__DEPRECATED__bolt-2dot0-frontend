'use strict';

let express = require('express');
let router = express.Router();

let LocationModel = require(process.cwd() + '/app/builders/common/LocationModel');
let ModelBuilder = require(process.cwd() + '/app/builders/common/ModelBuilder');
let cors = require(process.cwd() + '/modules/cors');

// route is /api/locate/locationlatlong
router.get('/locationlatlong', cors, (req, res) => {
	let modelBuilder = new ModelBuilder();

	let model = modelBuilder.initModelData(res.locals.config, req.app.locals, req.cookies);
	let geoCookieValue = req.cookies['geoId'];

	model.LocationModel = new LocationModel(model.bapiHeaders);

	model.LocationModel.getLocationLatLong(geoCookieValue).then((results) => {
		res.send(results);
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
