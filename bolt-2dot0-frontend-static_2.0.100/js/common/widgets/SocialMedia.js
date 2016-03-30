(function($){
	
    var pinDisc = $(".vip-details .description").text(),
	pinMedia = $("img[data-index]").attr("src") != null ? encodeURIComponent( $("img[data-index]").attr("src")) : null;
				
	var showCount = function() {			
		$(".box").show();
		$(".sm-ul").show();
	};

    /**
     * @method buildSocialUrl
     * @description Builds Social networking URLs for various social network links
     * @param {Object} $this
     * @param {String} site
     * @param {String} encodedUrl
     * @param {String} hashTags
     * @public
     */
    var buildSocialUrl = function ($this, site, encodedUrl, hashTags) {
        var siteURL;
        hashTags = hashTags || "";
        switch (site) {
            case "facebook":
                siteURL = "https://www.facebook.com/sharer/sharer.php?u=";
                $this.parent().attr('href', siteURL + encodedUrl);
                break;
            case "gmailplus":
                siteURL = "https://plus.google.com/share?url=";
                $this.parent().attr('href', siteURL + encodedUrl);
                break;
            case "twitter":
                siteURL = "https://twitter.com/intent/tweet?url=";
                $this.parent().attr('href', siteURL + encodedUrl + '&text=' + $this.data('text').format($(".myAdTitle").text()) + hashTags);
                break;
            case "pinterest":
                siteURL = "http://pinterest.com/pin/create/button/?url=";
                $this.parent().attr('href', siteURL + encodedUrl + '&media=' + pinMedia + '&description=' + pinDisc);
                break;
            case "linkedin":
                siteURL = "http://www.linkedin.com/shareArticle?mini=true&url=";
                $this.parent().attr('href', siteURL + encodedUrl);
                break;
            case "mail":
                $('#sm .mailto a').attr('href', 'mailto:?subject=' + $this.data('subject').format($(".item-title").text()) + '&body=' + $this.data('body').format(encodeURIComponent(window.location.href)));
                break;
        }
    };

    /**
     * @method getSiteName
     * @description Gets a site name given a className
     * @param {String} site (a classname that contains a site separated by "-")
     * @public
     * @return {String}
     */
    var getSiteName = function (site) {
        site = site.substring(0, site.indexOf(' '));
        site = site.substring(site.indexOf('-') + 1);
        site = site.substring(site.indexOf('-') + 1);
        return site;
    };

    $("document").ready(function(){
		// added this try/catch because explorer
		// is failing and have no time to debug
		try{
			var site,
                encodedUrl,
                hashTags,
                $itemAnchorObj,
                $this;

            // For places where we have many sets of social networking buttons (MyAds)
            if ($(".sm").doesExist()) {
                $(".sm").show();
                showCount();

                $(".sm li a span").each(function (idx) {
                    $this = $(this);
                    $this.on("click", function(e) {
                        site = getSiteName(this.className);
                        $itemAnchorObj = $(this).closest(".commercial").find(".everything-else .title a");
                        encodedUrl = encodeURIComponent($itemAnchorObj.attr("href") || "");
                        $(this).data('text', $itemAnchorObj.text());
                        hashTags = "&hashtags=" + brName;
                        buildSocialUrl($(this),  site, encodedUrl, hashTags);
                    });
                });
            }

            // for places where we have one set of social networking buttons
			if ($("#sm").doesExist()) {
				$("#sm").show();
				showCount();

				$("#sm li a span").on("click", function(e) {
                    site = getSiteName(this.className);
                    encodedUrl = encodeURIComponent(this.baseURI);
                    buildSocialUrl($(this),  site, encodedUrl, "");
                });
			}
		} catch(e) {}
	});					
	   	
})($);