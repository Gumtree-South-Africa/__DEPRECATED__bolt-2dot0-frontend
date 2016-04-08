/**
 * @module chunk headers
 * @description a middleware for chunking headers
 * @author aganeshalingam@ebay.com
 */

"use strict";
var cuid = require('cuid');
var M = require('mstring');

module.exports = function() {
   var  HeaderOnlyModel= require(process.cwd() + '/app/builders/page/HomePageModel').HeaderOnlyModel,
       deviceDetection = require(process.cwd() + '/modules/device-detection'),
       marketoService = require(process.cwd() + '/server/utils/marketo');

    return function(req, res, next) {

        var context;

        var modelData = {};
        var bapiConfigData = res.locals.config.bapiConfigData; 

        // Retrieve Data from Model Builders
        var model = HeaderOnlyModel(req, res);
        model.then(function (result) {

            // console.log('promise', result);

            // Make sure the array only has one element
            // Dynamic Data from BAPI
            modelData = result[0]; // .header = result.header || {};

            // get the css for the page rendering

            // CSS
            modelData.header.pageCSSUrl = modelData.header.baseCSSUrl + 'HomePage.css';
            if (modelData.header.min) {
                if (deviceDetection.isHomePageDevice()) {
                    modelData.header.containerCSS.push(modelData.header.localeCSSPathHack + '/HomePageHack.min.css');
                } else {
                    modelData.header.containerCSS.push(modelData.header.localeCSSPath + '/HomePage.min.css');
                }
            } else {
                if (deviceDetection.isHomePageDevice()) {
                    modelData.header.containerCSS.push(modelData.header.localeCSSPathHack + '/HomePageHack.css');
                } else {
                    modelData.header.containerCSS.push(modelData.header.localeCSSPath + '/HomePage.css');
                }
            }

           // console.log("MODEL DATA", modelData);
           // console.log("The header data is: " , modelData.header);

            var htmlHead = M(function(){
                /***
                 <!DOCTYPE html>
                 <!--[if IEMobile 7]>
                 <html data-locale="{{this.locale}}" lang="{{this.header.languageCode}}" class="iem7 oldie {{this.header.pageType}}"><![endif]-->
                 <!--[if (IE 7)&!(IEMobile)]>
                 <html data-locale="{{this.locale}}" lang="{{this.header.languageCode}}" class="ie7 lt-ie8 lt-ie9 lt-ie10 oldie {{this.header.pageType}}"><![endif]-->
                 <!--[if (IE 8)&!(IEMobile)]>
                 <html data-locale="{{this.locale}}" lang="{{this.header.languageCode}}" class="ie8 lt-ie9 lt-ie10 oldie {{this.header.pageType}}"><![endif]-->
                 <!--[if (IE 9)&!(IEMobile)]>
                 <html data-locale="{{this.locale}}" lang="{{this.header.languageCode}}" class="ie9 lt-ie10 {{this.header.pageType}}"><![endif]-->
                 <!--[if (gt IE 9)|(gt IEMobile 7)]><!-->
                 <html data-locale="{{this.locale}}" lang="{{this.header.languageCode}}" xmlns="http://www.w3.org/1999/html" class="{{this.header.pageType}}"><!--<![endif]-->
                 <head>

                 {{#if this.header.seoDeeplinkingUrlAndroid}}
                 <link rel="alternate" href="{{this.header.seoDeeplinkingUrlAndroid}}"/>
                 {{/if}}

                 {{#each this.header.containerCSS}}
                 <link rel="stylesheet" type="text/css" href='{{this}}'/>
                 {{/each}}

                 ***/});

            // Set anonUsrId cookie with value from cuid
            if (!req.cookies['anonUsrId']) {
                res.cookie('anonUsrId', cuid(), {'httpOnly': true});
            }

            marketoService.deleteMarketoCookie(res, modelData.header);
            
            var template = res.locals.hbs.handlebars.compile(htmlHead);

            var context = {title: "My New Post", body: "This is my first post!"};
            var html    = template(modelData);

         // console.log("xxxxxxxxhtmlxxxxx" + modelData.header.containerCSS);
            //res.setHeader('Connection', 'Transfer-Encoding');
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            //res.setHeader('Transfer-Encoding', 'chunked');

            res.write(html, "utf8");
            res.flush();

            next();

        });




    }
}