'use strict';

let express = require('express');
let router = express.Router();

let LocationModel = require(process.cwd() + '/app/builders/common/LocationModel');
let ModelBuilder = require(process.cwd() + '/app/builders/common/ModelBuilder');
let cors = require(process.cwd() + '/modules/cors');
let logger = require(`${cwd}/server/utils/logger`);

// route is /api/locate/locationlatlong
router.get('/locationlatlong', cors, (req, res) => {
	let modelBuilder = new ModelBuilder();
	let model = modelBuilder.initModelData(res.locals, req.app.locals, req.cookies);

	let geoLatLngObj;
	// if a lat long is passed as a query param use it over the cookie
	if (req.query.lat && req.query.lng) {
		if (Number.isNaN(Number.parseFloat(req.query.lat)) || Number.isNaN(Number.parseFloat(req.query.lat))) {
			res.status(400);
			res.send({  error: "query params could not be parsed into numbers"});
			return;
		}
		// params are good
		geoLatLngObj = {
			lat: req.query.lat,
			lng: req.query.lng
		};
	} else {
		if (!model.geoLatLngObj) {
			res.status(400);
			res.send({  error: "query params or cookie required"});
			return;
		}
		geoLatLngObj = model.geoLatLngObj;
	}
	let checkLeafLocations = (req.query.leaf === 'true');

	model.LocationModel = new LocationModel(model.bapiHeaders);

	model.LocationModel.getLocationLatLong(geoLatLngObj, checkLeafLocations).then((results) => {
		res.send(results);
	}).fail((err) => {
		let bapiJson = logger.logError(err);
		res.status(err.getStatusCode(500)).send({
			error: "latLong look up failed, see logs for details",
			bapiJson: bapiJson
		});
	});

});

module.exports = router;
