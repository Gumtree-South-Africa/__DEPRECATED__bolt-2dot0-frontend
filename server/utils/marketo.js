'use strict';

/**
 * @description A Marketo related utils class
 * @constructor
 */
var MarketoService = function() {};

/**
 * To get the marketo data for Home page.
 */
MarketoService.prototype.buildMarketoDataForHP = function(modelData) {
	modelData.header.marketo.isAssociateLead = true;

	modelData.header.marketo.marketoAttributeJsonStr = {};
	if (typeof modelData.header.userEmail !== 'undefined') {
		modelData.header.marketo.marketoAttributeJsonStr.email = modelData.header.userEmail;
	}
	modelData.header.marketo.brandCode = '';
	if (typeof modelData.header.firstName !== 'undefined') {
		modelData.header.marketo.marketoAttributeJsonStr.firstName = modelData.header.firstName;
	}
	if (typeof modelData.header.lastName !== 'undefined') {
		modelData.header.marketo.marketoAttributeJsonStr.lastName = modelData.header.lastName;
	}
	if (typeof modelData.header.username !== 'undefined') {
		modelData.header.marketo.marketoAttributeJsonStr.userName = modelData.header.username;
	}
	if (typeof modelData.header.registered !== 'undefined') {
		modelData.header.marketo.marketoAttributeJsonStr.isRegistered = modelData.header.registered;
		if (modelData.header.registered == true && typeof modelData.header.registrationCountry !== 'undefined') {
			modelData.header.marketo.marketoAttributeJsonStr.registrationCountry = modelData.header.registrationCountry;
		}
	}
	if (typeof modelData.header.creationDate !== 'undefined') {
		modelData.header.marketo.marketoAttributeJsonStr.creationDate = modelData.header.creationDate;
	}
}

MarketoService.prototype.deleteMarketoCookie = function(res, header) {
	var domainName;
	if (typeof header.marketo.domainName !== undefined){
		domainName = header.marketo.domainName;
	}else {
		domainName = '.'+ header.marketo.domainName;
	}
	
	var isDelete = header.marketo.deletecookie;
	if (isDelete == false) {
		res.cookie('_mkto_trk', '_mkto_trk', {domain: domainName, path: '/', maxAge: 0});
	}
}


module.exports = new MarketoService();
