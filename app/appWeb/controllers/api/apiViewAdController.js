'use strict';

let express = require('express');
let router = express.Router();

let cwd = process.cwd();
let ModelBuilder = require(process.cwd() + '/app/builders/common/ModelBuilder');
let cors = require(cwd + '/modules/cors');

let AdvertModel = require(cwd + '/app/builders/common/AdvertModel.js');
let logger = require(`${cwd}/server/utils/logger`);

router.post('/:adId/inc-view-count', cors, (req, res) => {
	let modelBuilder = new ModelBuilder();
	let model = modelBuilder.initModelData(res.locals, req.app.locals, req.cookies);
	let advertModel = new AdvertModel(model.bapiHeaders);
	advertModel.addViewCount(req.params.adId).then((attributes) => {
		res.json(attributes);
	}).fail((err) => {
		let bapiJson = logger.logError(err);
		return res.status(err.getStatusCode(500)).json({
			error: "inc-view-count failed",
			bapiJson: bapiJson
		});
	});
});


module.exports = router;
