/**
 * @description A singleton object with utility methods related to HTML5
 * @namespace COMMON
 * @class HTML5
 * @public
 * @type Object|JSON
 */
var Bolt = Bolt || {};
(function () {

    var Private = {
            init: function () {
                Private.registerToWindow();
            },

            registerToWindow: function () {
                if (!window.Bolt) {
                    window.Bolt = {};
                }
                window.Bolt.HTML5 = HTML5;
            }
        },


        HTML5 = {
            // keeping in sync with Modernizr
            inputtypes: {
                /**
                 * @method isInputTypeSupported
                 * @description Checks if browser supports passed HTML5 input type
                 * @param {String} inputType Valid HTML5 input type to be tested for support
                 * @public
                 */
                _isInputTypeSupported: function (inputType) {
                    var $dateObj = $(document.createElement("input"));
                    $dateObj.attr("type", inputType);
                    return $dateObj.attr("type") === inputType;
                },

                /**
                 * @method date
                 * @description Checks if browser supports <input type="date">
                 * @public
                 */
                date: function () {
                    return Bolt.HTML5.inputtypes._isInputTypeSupported('date');
                }
            },

            placeholder: {
                isSupportedByBrowser: function () {
                    var input = document.createElement('input');
                    return ('placeholder' in input);
                },

                applyPolyfill: function($inputElements) {
                    $inputElements.each(function(e) {
                        var $input = $(this);

                        // Ignore elements without 'placeholder' attribute
                        if (!$input.attr('placeholder')) {
                            return;
                        }

                        // Clear placeholder text first
                        if ($input.val() == $input.attr('placeholder')) {
                            $input.val('');
                        }

                        $input
                            .focus(function() {
                                var $input = $(this);
                                if ($input.val() == $input.attr('placeholder')) {
                                    $input.removeClass('placeholder').val('');
                                }
                            })
                            .blur(function() {
                                var $input = $(this),
                                    placeholderVal = $input.attr('placeholder');

                                if ($input.val() == '' || $input.val() == placeholderVal) {
                                    $input.addClass('placeholder').val(placeholderVal);
                                }
                            })
                            .blur();
                    });
                }

            }


        };

    Private.init();
})();