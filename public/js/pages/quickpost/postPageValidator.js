	"use strict";

	var BOLT = BOLT || {};
	BOLT.POST = BOLT.POST || {};

	/**
	 * @description A singleton object that represents the model (data) needed for the JQuery Validation plugin to
	 *     validate form fields in the Post Page. 
	 * Please refer to : https://jqueryvalidation.org/ for more info on the library.
	 * @namespace BOLT.POST
	 * @class Validation
	 * @public
	 * @type Object|JSON
	 */
	BOLT.POST.Validation = (function () {

		// Private methods
		var _PM = {
		   /**
		    * @method setValidationDefaults
		    * @description Set the defaults to the client validation engine
		    * @private
		    */
			setValidationDefaults : function () {
				$.validator.setDefaults({
					submitHandler: function() {
						// Whatever needs to be done for form submit.
						return true;
					},
					ignore: [] // This enables validation on all fields
				});
			},

		   /**
		    * @method addMethods
		    * @description Add Custom validation methods
		    * @private
		    */
			addMethods : function() {

				// Check for valid description
				$.validator.addMethod("validDescription", function(value, element) {
					return this.optional(element) ||
						/^(\s|\w|\W|\\u[a-fA-F0-9]{4}|<b>|<\/b>|<i>|<\/i>|<li>|<\/li>|<p>|<\/p>|<br>|<ol>|<\/ol>|<u>|<\/u>|<ul>|<\/ul>|<div>|<\/div>)*?$/i.test(value);
				});

			   // Check for valid location
			   $.validator.addMethod("validLocation", function(value, element) {
				   return this.optional(element) ||
					   /^(\s|\w|\d|,|.|-|\\u[a-fA-F0-9]{4})*?$/i.test(value);
			   });
			}

		};

		// Public Methods
		return {
		   /**
		    * @method init
		    * @description Initializes the client validation engine
		    * @public
		    */
			init : function () {
				// Prepare validation
				_PM.setValidationDefaults();
				_PM.addMethods();

				// validate the Post form
				$("#postForm").validate({
					rules: {
						Description: {
							required: true,
							minlength: 10,  // 10
							maxlength: 4096, // 4096
							validDescription: true
						},
						Category: "required",
						Location: {
							required: true,
							validLocation: true
						},
						price:{
						  maxlength: 10
						}
					},

					messages: {
						Description: {
							required: (typeof $("#Description").attr("data-errorFlash") === 'undefined') ? $("#Description").attr("data-errorDescriptionReqd") : '',
							minlength: (typeof $("#Description").attr("data-errorFlash") === 'undefined') ? $("#Description").attr("data-errorDescriptionShort") : '',
							maxlength: (typeof $("#Description").attr("data-errorFlash") === 'undefined') ? $("#Description").attr("data-errorDescriptionLong") : '',
							validDescription: (typeof $("#Description").attr("data-errorFlash") === 'undefined') ? $("#Description").attr("data-errorDescriptionInvalid") : ''
						},
						Category: {
							required: (typeof $("#catSelector").attr("data-errorFlash") === 'undefined') ? $("#catSelector").attr("data-errorCategoryReqd") : ''
						},
						Location: {
							required: (typeof $("#Location").attr("data-errorFlash") === 'undefined') ? $("#Location").attr("data-errorLocationReqd") : '',
							validLocation: (typeof $("#Location").attr("data-errorFlash") === 'undefined') ? $("#Location").attr("data-errorLocationInvalid") : ''
						},
						price: {
						
							maxlength: (typeof $("#Price").attr("data-errorFlash") === 'undefined') ? $("#Price").attr("data-errorPriceLong") : ''
							
						}
						
					}
				});
			}
		}; // return
	})(); // Singleton

	// Please refactor this to a centralized place...
	$(document).ready(function() {
		BOLT.POST.Validation.init();
	});