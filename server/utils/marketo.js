"use strict";

var config = require('config');

/**
 * @description A Marketo related utils class
 * @constructor
 */
var MarketoService = function() {};

/**
 * To get the marketo data for Home page.
 */
MarketoService.prototype.buildMarketoDataForHP = function(modelData) {
	if (typeof modelData.header.id !== 'undefined') {
		modelData.header.marketo.isAssociateLead = true;
		if (typeof modelData.header.userEmail !== 'undefined') {
			modelData.header.marketo.email = modelData.header.userEmail;
		}
		modelData.header.marketo.brandCode = '';
		if (typeof modelData.header.firstName !== 'undefined') {
			modelData.header.marketo.firstName = modelData.header.firstName;
		}
		if (typeof modelData.header.lastName !== 'undefined') {
			modelData.header.marketo.lastName = modelData.header.lastName;
		}
		if (typeof modelData.header.username !== 'undefined') {
			modelData.header.marketo.userName = modelData.header.username;
		}
		if (typeof modelData.header.registered !== 'undefined') {
			modelData.header.marketo.isRegistered = modelData.header.registered;
			if (modelData.header.registered == true && typeof modelData.header.registrationCountry !== 'undefined') {
				modelData.header.marketo.registrationCountry = modelData.header.registrationCountry;
			}
		}
		if (typeof modelData.header.creationDate !== 'undefined') {
			modelData.header.marketo.creationDate = modelData.header.creationDate;
		}
	}
}

MarketoService.prototype.deleteMarketoCookie = function(resp,header) {
	var domainName
	if (typeof header.marketo.domainName !== undefined){
		domainName= header.marketo.domainName;
	}else {
		domainName="."+ header.marketo.domainName;
	}
	var isDelete = header.marketo.deletecookie;
if (header.delete.marketo.cookie == true)
resp.cookie('_mkto_trk','',{domain: domainName ,path:'/' ,maxAge:0});
}


module.exports = new MarketoService();
