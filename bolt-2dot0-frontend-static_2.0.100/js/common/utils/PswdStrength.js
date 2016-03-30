/*!
 * PswdStrength.js
 *
 * Copyright 2015 eBay Inc.
 * @author: Ulises Robles (uroblesmellin@)
 * @description Plugin that implements password strength functionality.
 * @namespace $
 * @class PswdStrength
 */

(function ($) {
    "use strict";

    /**
     * @property defaultOptions
     * @description JSON with all the default options required for this widget
     * @type JSON
     * @private
     */
    var defaultOptions = {
        // The number of animated bars
        numBars: 4,

        // The scoring points limits array
        scores: [20, 40, 60, 75, 85],

        // The mapping names (css classes) corresponding to the scores
        ratings: ["short", "weak", "fair", "good", "strong"], // ["Weak", "Normal", "Medium", "Strong", "Very Strong"],

        // The mapping between the ratings and the labels.
        ratingMap: {
            "short": "Short",
            "weak": "Weak",
            "fair": "Fair",
            "good": "Good",
            "strong": "Strong"
        },

        // If we show the labels rating or not.
        showRating: true,

        // The default widths for each state of the progress bars
        progressBarData: [
            { "cssClass": "progress-weak", width: [20, 0, 0, 0] } ,
            { "cssClass": "progress-weak", width: [100, 0, 0, 0] },
            { "cssClass": "progress-fair", width: [100, 100, 0, 0] },
            { "cssClass": "progress-good", width: [100, 100, 100, 0] },
            { "cssClass": "progress-strong", width: [100, 100, 100, 100] }
        ]
    };

    // Options to be used in every instance (by cloning and extending the default ones)
    var options = {};

    // Total animation time per bar
    var barAnimEllapse = 150;

    // Compute total animation time ellapse
    var totalBarAnimEllapse = barAnimEllapse * defaultOptions.numBars;

    /*
    // @todo: Check this
    var scoreChanged = false;
    */

    // Private Methods will go here:
    var _PM = {

        /**
         * @method clearProgressBarClass
         * @description Removes all the css classes from the progress bar
         * @param {Object}
         * @public
         */
        clearProgressBarClass: function (progressbar, cssClass) {
            progressbar.removeClass(function (index, css) {
                return (css.match(/\bprogress-\S+/g) || []).join(' ');
            }).addClass(cssClass);
        },

        /**
         * @method animateBars
         * @description Animate the "n" bars inside the progressbar object
         * @param {Number} score  The new score
         * @param {Number} currentScore
         * @param {Object} progressbar The progress bar DOM object (container for the smaller bars)
         * @param {Number} indexOfBarData
         * @public
         */
        animateBars: function (score, currentScore, progressbar, indexOfBarData) {
            var cssClass = options.progressBarData[indexOfBarData].cssClass;
            var barsPercentageArr = options.progressBarData[indexOfBarData].width;

            var self = this;
            var idx = 0,
                barDataArr = [],
                barElem,
                cssWidth;

            // Reset the bars colors if there is no score.
            if (score == 0) {
                PASSWORD_STRENGTH.resetBars(progressbar);
                return true;
            }

            // Remove all the current classes from the progressbar obj that start with "progress-"
            if (currentScore <= score) {
                /*
                // @todo: Check this
                if (!progressbar.hasClass(cssClass)) {
                    scoreChanged = true;
                }
                */
                self.clearProgressBarClass(progressbar, cssClass);
            }

            // Add the percentages from each bar to an array to be used to do the animation
            // This array will be use to animate each of the bars
            progressbar.find('.bar').each(function () {
                barElem = $(this);
                cssWidth = barsPercentageArr[idx++] + "%";
                barDataArr.push({
                    obj: barElem,    // Bar DOM object
                    width: cssWidth  // New width of that bar
                });
                // @todo:
                // barElem.data("css-width", cssWidth);
            });

            // Peform the actual animation using the array having each of the bars info.
            self.animate(barDataArr);

            // If the new score is smaller than the current one, clear up the progressbar CSS classes.
            if (currentScore > score) {
                setTimeout(function () {
                    self.clearProgressBarClass(progressbar, cssClass);
                }, totalBarAnimEllapse);
            }
        },

        /**
         * @method animate
         * @description Performs the animation for each of the bars recursively.
         * @param {Array[Number]} barDataArr Array with the bars info to use to animate each of them
         * @public
         */
        animate: function (barDataArr) {
            var self = this;

            // Get the first bar info
            var bar_i = barDataArr.shift();
            if (!bar_i) {
                return;
            }

            // Set the width for that bar
            bar_i.obj.css("width", bar_i.width);

            // Recursively animate the rest of the bars after a delay
            if (barDataArr.length > 0) {
                setTimeout(function () {
                    self.animate(barDataArr)
                }, barAnimEllapse);
            }
        },

        /**
         * @method renderAllBars
         * @description
         * @param {Object} $el DOM element to be used as a reference (password input field)
         * @param {Number} score New strength score
         * @param {Object} $progressbar Progress bar DOM container
         * @public
         */
        renderAllBars: function ($el, score, currentScore, $progressbar) {
            var self = this,
                $ratingObj,
                idx_i = -1,
                idx_j = -1,
                limit;

            // Update the Rating label
            if (options.showRating) {
                $ratingObj = $el.parent().find(".password-rating");
                if ($ratingObj.length === 0) {
                    $ratingObj = $('<span class="password-rating"></span>');
                    $ratingObj.insertAfter($el);
                }
            }

            // Loop thru all the scores, and animate all the bars according to the current score
            for (idx_i = 0; idx_i <= options.scores.length; ++idx_i) {
                idx_j = idx_i;
                limit = 0;

                if (idx_i === options.scores.length) {
                    idx_j = idx_i - 1;
                } else {
                    limit = options.scores[idx_i];
                }

                // If the score is less than the current limit, animate the bars and stop.
                if (score < limit || idx_i === options.scores.length) {
                    self.animateBars(score, currentScore, $progressbar,idx_j, $ratingObj); // [100, 100, 100, 0]);
                    if (options.showRating) {
                        $ratingObj.removeClass().addClass("password-rating").addClass(options.ratings[idx_j]);
                        $ratingObj.html((score > 0) ? options.ratingMap[options.ratings[idx_j]] : "");
                        if (score == 0) {
                            PASSWORD_STRENGTH.resetBars($progressbar);
                        }
                    }
                    break;
                }
            }
        }
    };

    // Public Methods
    var PASSWORD_STRENGTH = {

        /**
         * @property currentScore
         * @description Stores the current strength score
         * @type {Number}
         * @public
         */
        currentScore : 0,

        /**
         * @method resetBars
         * @description Resets the widths of the bars, removes css classes from bars.
         * @param {Object} $progressbarObj Container of the bars
         * @public
         */
        resetBars: function ($progressbarObj) {
            $progressbarObj.find('.bar').each(function () {
                $(this).css("width", "0%");
                $(this).attr("class", "bar");
            });
            $progressbarObj.removeClass(function (index, css) {
                return (css.match(/\bprogress-\S+/g) || []).join(' ');
            });
        },

        /**
         * @method setProgressBar
         * @description Builds all the bars given a score
         * @param {Object} Input field to build the bars before from.
         * @param score New strength score
         * @public
         */
        setProgressBar: function ($el, score) {
            //var options = $el.data("pwstrength"),
            var $progressbarObj = $el.data("pwstrength").progressbar;
            _PM.renderAllBars($el, score, this.currentScore, $progressbarObj);
            this.currentScore = score;
        },

        /**
         * @method updateProgressBar
         * @description Visually updates the status of the progress bar. Calls the computation of the new score
         * @param {Object} $el DOM element to be used as a reference.
         * @public
         */
        updateProgressBar: function ($el) {
            var word = $el.val(),
                totalScore = 0;
            totalScore = this.computeScore(word);
            this.setProgressBar($el, totalScore);
        },

        /**
         * @method computeScore
         * @description Computes the new password strength score
         * @param {String} pass User pass
         * @public
         * @return {Number} Resulting score
         */
        computeScore: function (pass) {
            var score = 0,
                letters = {},
                variations,
                check,
                idx = 0,
                variationCount = 0;

            if (!pass)
                return score;

            // Algorithm rules:
            // 1.- Award every unique letter until 5 repetitions
            for (idx = 0; idx < pass.length; idx++) {
                letters[pass[idx]] = (letters[pass[idx]] || 0) + 1;
                score += 5.0 / letters[pass[idx]];
            }

            // 2.- Bonus points for mixing it up
            variations = {
                digits: /\d/.test(pass),
                lower: /[a-z]/.test(pass),
                upper: /[A-Z]/.test(pass),
                nonWords: /\W/.test(pass),
            };

            // 3.- Add points for variations
            for (check in variations) {
                variationCount += (variations[check] == true) ? 1 : 0;
            }
            score += (variationCount - 1) * 10;

            return parseInt(score);
        },

        /**
         * @method buildProgressBarsHTML
         * @description Builds the progress bars HTML
         * @param {Number} numBars Number of bars to show
         * @public
         * @return {String} Progress bar HTML
         */
        buildProgressBarsHTML: function (numBars) {
            var idx , arr = [ '<div class="progress">' ];
            for (idx = 0; idx < numBars; ++idx) {
                arr.push('<div class="bar-cont"><div class="bar"></div></div>');
            }
            arr.push('</div>');
            return arr.join("");
        },

        /**
         * @field methods
         * @description JSON with the methods exposed to the user
         * @public
         */
        methods: {
                init: function (settings) {
                    var self = this,
                        PS = PASSWORD_STRENGTH;

                    options = $.extend(true, {}, defaultOptions);
                    options = $.extend(options, settings);

                    // Compute total animation time ellapse
                    totalBarAnimEllapse = barAnimEllapse * options.numBars;

                    return this.each(function (idx, el) {
                        var $el = $(el),
                            progressbar,
                            rating;

                        $el.data("pwstrength", options);
                        $el.on("keypress keyup keydown", function () {
                            var pass = $(this).val();
                            PS.updateProgressBar($(this));
                        });

                        // @todo: remove hardcoded value
                        progressbar = $(PS.buildProgressBarsHTML(options.numBars));
                        progressbar.insertBefore($el);
                        PS.resetBars(progressbar);
                        // @todo:
                        // PS.setEvents(progressbar);
                        $el.data("pwstrength").progressbar = progressbar;

                        if (options.showRating) {
                            rating = $('<span class="password-rating"></span>');
                            rating.insertBefore(progressbar);
                        }

                    });
                }
            }
    };

    $.fn.pwstrength = function (method) {
        var result;
        result = PASSWORD_STRENGTH.methods.init.apply(this, arguments);
        return result;
    };
}(jQuery));



