'use strict';

let express = require('express');
let router = express.Router();

router.get('/', function(req, res) {
	let modelData = {'botsFbWebhook_Locale': res.locals.config.locale};
	res.json(modelData);
});


module.exports = router;
