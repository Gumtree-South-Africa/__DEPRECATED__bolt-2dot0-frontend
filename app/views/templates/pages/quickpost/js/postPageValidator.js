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

				// Check for valid description - change if required :)
				$.validator.addMethod("validDescription", function(value, element) {
			            return this.optional(element) || /^(\s|\w|\d|<br>|<ul>|<\ul>)*?$/i.test(value);
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
						Category: "required",
						Description: {
							required: true,
							minlength: 5,  // 100
							maxlength: 20, // 4096
							validDescription : true
						}
					},

					messages: {
						Category : {
							required: "Category is required"
						},
						Description: {
							required: "Description is required",
							minlength: "Description is too short",
							maxlength: "Description is too long",
							validDescription : "Invalid Description"
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