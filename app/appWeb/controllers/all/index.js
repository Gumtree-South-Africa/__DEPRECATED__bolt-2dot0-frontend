'use strict';

let express = require('express');
let router = express.Router();

router.use('/activate', require('./activatePageController'));
router.use('/register', require('./registerPageController'));
router.use('/login', require('./loginPageController'));
router.use('/logout', require('./logoutController'));
router.use('/app-shell', require('./appShellController'));
router.use('/manifest.json', require('./manifestController'));
router.use('/service-worker.js', require('./serviceWorkerController'));
router.use('/post', require('./postpageController'));
router.use('/edit', require('./editpageController'));
router.use('/quickpost', require('./quickpostController'));
router.use('/view', require('./viewPageController'));
router.use('/', require('./homepageController'));
router.use('/', require('./searchPageController'));

module.exports = router;
