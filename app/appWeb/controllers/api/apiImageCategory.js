'use strict';

let express = require('express');
let router = express.Router();
let cwd = process.cwd();
let IrsModel = require(cwd + '/app/builders/common/IrsModel');
let cors = require(cwd + '/modules/cors');
let logger = require(`${cwd}/server/utils/logger`);
let ModelBuilder = require(cwd + '/app/builders/common/ModelBuilder');

// route is /api/irs
router.post('/', cors, (req, res) => {
	let imageUrl = req.body.url;
	let modelBuilder = new ModelBuilder();
	let model = modelBuilder.initModelData(res.locals, req.app.locals, req.cookies);
	model.IrsModel = new IrsModel(model.bapiHeaders);

	model.IrsModel.getImageCategory(imageUrl).then((categories) => {

		let category = categories.reduce((pre, cur) => {
			return pre.quality > cur.quality ? pre : cur;
		},{"categoryId":"1","matches":1,"quality":0});

		res.send(category.categoryId);

	}).fail((err) => {
		let bapiJson = logger.logError(err);
		res.status(err.getStatusCode(500)).send({
			error: "Image category look up failed, see logs for details",
			bapiJson: bapiJson
		});
	});

});

module.exports = router;
