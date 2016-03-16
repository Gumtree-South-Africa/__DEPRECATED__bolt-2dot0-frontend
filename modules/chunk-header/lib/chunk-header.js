/**
 * @module chunk headers
 * @description a middleware for chunking headers
 * @author aganeshalingam@ebay.com
 */

"use strict";

module.exports = function() {
   var  HeaderOnlyModel= require(process.cwd() + '/app/builders/page/HomePageModel').HeaderOnlyModel;

    return function(req, res, next) {
        var M = require('mstring');
        var context;

        var modelData = {};
        var bapiConfigData = res.locals.config.bapiConfigData; console.log("xxxxxxx hello xxxxxx");

        // Retrieve Data from Model Builders
        var model = HeaderOnlyModel(req, res);
        model.then(function (result) {

            // console.log('promise', result);

            // Make sure the array only has one element
            // Dynamic Data from BAPI
            modelData = result[0]; // .header = result.header || {};

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

            var template = res.locals.hbs.handlebars.compile(htmlHead);

            var context = {title: "My New Post", body: "This is my first post!"};
            var html    = template(modelData);

            console.log("xxxxxxxxhtmlxxxxx" + html);

        });



        res.write(htmlHead, "utf8");
        res.flush();

        next();
    }
}