'use strict';

let express = require('express');
let router = express.Router();

let routesMap = {
  '/': './homepageController',
  '/activate': './activatePageController',
  '/app-shell': './appShellController',
  '/edit': './editpageController',
  '/login': './loginPageController',
  '/logout': './logoutController',
  '/manifest.json': './manifestController',
  '/post': './postpageController',
  '/quickpost': './quickpostController',
  '/register': './registerPageController',
  '/search': './searchPageController',
  '/service-worker.js': './serviceWorkerController',
  '/view': './viewPageController'
};

for (let route in routesMap) {
  if (routesMap.hasOwnProperty(route)) {
    router.use(route, require(routesMap[route]));
  }
}

module.exports = router;
