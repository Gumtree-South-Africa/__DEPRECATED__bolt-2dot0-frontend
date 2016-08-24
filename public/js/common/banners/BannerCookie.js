/**** ********************  BOLT.BannerCookie  *******************
 /**
 * @description Definition a Singleton implementing the Banner Cookie: See BOLT-15687
 *     To be used as follows: BOLT.BannerCookie.<methodName>();
 * @namespace BOLT
 * @class BannerCookie
 * @author uroblesmellin@
 */
window.BOLT = window.BOLT || {};

/**
 * @description A singleton object
 * @namespace BOLT
 * @class BannerCookie
 * @public
 * @type Object|JSON
 */
BOLT.BannerCookie = (function () {
    var cookieBannerContainerExpr;
    var cookieValue = null;

    function removeCookieBanner() {
        if (cookieBannerContainerExpr) {
            $(cookieBannerContainerExpr).remove();
        }
    }

    function showCookieBanner() {
        if (cookieBannerContainerExpr) {
            $(cookieBannerContainerExpr).show();
        }
    }

    // Public methods
    return {

        /**
         * @method init
         * @description Initializes the Page Contextual Info object
         * @param {String} cookieName Name of the Banner Cookie
         * @param {String} bannerContainerId DOM ID of the container for the banner message
         * @param {Number} maxDisplays Integer indicating the max. number of impressions of the banner message
         * @public
         */
        visit: function (cookieName, bannerContainerId, maxDisplays) {
            var sessionCookieName = null,
                sessionCookieValue = null;

            if (!BOLT.UTILS || !BOLT.UTILS.Cookie || !cookieName || !bannerContainerId) {
                return false;
            }

            cookieBannerContainerExpr = "#" + bannerContainerId;
            if (!$(cookieBannerContainerExpr).length) {
                return false;
            }

            // Get the cookie name (add the country name for uniqueness).
            this.cookieName = cookieName; // + (Bolt.COUNTRY ? "-" + Bolt.COUNTRY.toLowerCase() : "");
            sessionCookieName = this.cookieName + "-session";
            this.maxDisplays = maxDisplays || undefined;

            // Read the regular cookie value
            cookieValue = BOLT.UTILS.Cookie.readCookie(this.cookieName);
            cookieValue = (cookieValue == null || cookieValue == "") ? 0 : (cookieValue - 0);

            // Get the session cookie value
            if (sessionStorage && sessionStorage[sessionCookieName]) {
                sessionCookieValue = sessionStorage[sessionCookieName];
            }

            // If there is no session cookie, increment the value of the regular cookie.
            // Also set a value to the session cookie
            if (!sessionCookieValue) {
                if (typeof this.maxDisplays !== "undefined" && cookieValue <= this.maxDisplays) {
                    ++cookieValue;

                    // Setting the new cookie value
                    // $.cookie(this.cookieName, cookieValue, 365);
                    BOLT.UTILS.Cookie.setCookie(this.cookieName, cookieValue, 365);
                }
                sessionStorage[sessionCookieName] = "session";
            }

            // Attach basic DOM manipulations.
            this.renderUI();

            // Attach event handlers.
            this.syncUI();

            return true;
        },

        /**
         * @method renderUI
         * @description Handles the initial DOM manipulations for this class
         * @public
         */
        renderUI: function () {
            if (typeof this.maxDisplays !== "undefined") {
                if (cookieValue <= this.maxDisplays) {
                    showCookieBanner();
                } else {
                    removeCookieBanner();
                }
            } else {
                showCookieBanner();
            }
        },

        /**
         * @method syncUI
         * @description Handles the initial event manipulations for this class
         * @public
         */
        syncUI: function () {
            var SCOPE = this;
            $("body")
                // If there is a Cookie banner, process it
                .on("click", cookieBannerContainerExpr + " .accept", function () {

                    BOLT.UTILS.Cookie.setCookie(SCOPE.cookieName, SCOPE.maxDisplays + 1,  365);
                    $(cookieBannerContainerExpr).slideUp("slow", function () {
                        // Animation complete.
                    });
                    return false;
                });
        },

        /**
         * @method syncUI
         * @description Handles the initial event manipulations for this class
         * @public
         */
        deleteCookie: function () {
            if (this.cookieName) {
                document.cookie = this.cookieName + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            }
        },

        /**
         * @method destroy
         * @description Handles the initial event manipulations for this class
         * @public
         */
        destroy: function () {
            this.deleteCookie();
            removeCookieBanner();
            this.cookieName = this.maxDisplays = cookieBannerContainerExpr = undefined;
            cookieValue = null;
        }
    };

})();


