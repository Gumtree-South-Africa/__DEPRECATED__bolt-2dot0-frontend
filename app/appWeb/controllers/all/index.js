'use strict';

let express = require('express');
let router = express.Router();

let completeRoutesMap = {
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
  '/view': './viewPageController',
  '/flagad': './flagAdController',
  '/promotead' : './promoteAdController'
};

for (let route in completeRoutesMap) {
	if (completeRoutesMap.hasOwnProperty(route)) {
    	router.use(route, require(completeRoutesMap[route]));
	}
}


let regexRoutesMap = {
	'/:seo(v-[0-9A-Za-z-+\/]+)': './viewPageController'
};

for (let route in regexRoutesMap) {
	if (regexRoutesMap.hasOwnProperty(route)) {
		router.use(route, require(regexRoutesMap[route]));
	}
}


module.exports = router;
