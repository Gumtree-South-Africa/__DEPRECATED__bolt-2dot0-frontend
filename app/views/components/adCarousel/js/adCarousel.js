// jshint ignore: start
"use strict";


(function() {
	$(document).ready(function() {
		if (typeof window.adList === "undefined") {
			return;
        }

        var adList = window.adList;
        // process the JSON to the BOLT 2.0 BAPI format
        adList = processDataJSON(adList);

		var	ads = adList.ads,
            nextUrl = adList.nextAjaxUrl,
            prevUrl = adList.previousAjaxUrl,
			$prev = null,
			$next = null,
            i = 0,
            pos = 0,
            oldNo = 0,

            adSizeLg = 122,
            adSizeSm = 78,

            imgSizeLg = 100,
            imgSizeSm = 60,

            panlObj = {
                leftnodesImages: [],
                midnodesImages: [],
                rightnodesImages: []
            },

            noofimages = 0,
            imageWidth = 60,
            adsRemaining = 8,
            currentImageIndex = -1,

            panelDirection = null,
            panelProperties = {},
            panelCnt = 3,
            midWidth = 0,

            firstIE = true,
            ie8 = false,
            ie9 = false,
            badBrowser = false;

		function init() {
		    if(typeof(ads) === "undefined")
		    {
		        return;
		    }
            if (navigator.appName.indexOf("Internet Explorer") !== -1) {
                var badBrowser = (
                    navigator.appVersion.indexOf("MSIE 9") === -1 &&
                    navigator.appVersion.indexOf("MSIE 1") === -1
                );

                ie8 = navigator.appVersion.indexOf("MSIE 8") !== -1 ? true : false;
                ie9 = navigator.appVersion.indexOf("MSIE 9") !== -1 ? true : false;

                if (badBrowser) {
                    badBrowser = true;
                }
            }

            // Add endAd if no more ads
            if (!nextUrl) {
                /*
                ads.push({
                    imgUrl: "#",
                    title: "endAd",
                    url: "#"
                });
                */

                ads.push({
                    primaryImgUrl: "#",
                    title: "endAd",
                    viewPageUrl: "#"
                });

            }

            panelProperties = getPanelProperties();
            noofimages = panelProperties.count;
            panelCnt = panelProperties.count;
            imageWidth = panelProperties.imgWidth;
            midWidth = panelProperties.midWidth;

            createCarousel();

            $prev = $(".c-nav .prev, .c-nav .left-arrow");
            $next = $(".c-nav .next, .c-nav .right-arrow");

            setNavigation();
		}

        function handleResize() {
            if (ie8 || ie9) {
                if (firstIE) {
                    firstIE = false;
                    return;
                }
            }

            if (!badBrowser) {
                setAdCount();
            }

            setNavigation();
        }

        function setNavigation() {
            if (ads.length <= currentImageIndex && ads.length <= noofimages) {

                // Left and Right are both off
                panlObj.ctrlLeft.off("click");
                $prev.removeClass("active");
                $prev.addClass("inactive");

                panlObj.ctrlRight.off("click");
                $next.removeClass("active");
                $next.addClass("inactive");

            } else if (ads.length > currentImageIndex && (currentImageIndex - noofimages) <= 0) {
                // Left is off and Right in on
                panlObj.ctrlLeft.off("click");
                $prev.removeClass("active");
                $prev.addClass("inactive");

                panlObj.ctrlRight.on("click", function() {movePanel(-1); });
                $next.removeClass("inactive");
                $next.addClass("active");

            } else if (currentImageIndex >= ads.lenth || currentImageIndex >= ads.length) {
                // Left is on and Right is off
                panlObj.ctrlLeft.on("click", function() {movePanel(1); });
                $prev.removeClass("inactive");
                $prev.addClass("active");

                panlObj.ctrlRight.off("click");
                $next.removeClass("active");
                $next.addClass("inactive");

            } else {
                // Left and Right are both on
                panlObj.ctrlLeft.on("click", function() {movePanel(1); });
                $prev.removeClass("inactive");
                $prev.addClass("active");

                panlObj.ctrlRight.on("click", function() {movePanel(-1); });
                $next.removeClass("inactive");
                $next.addClass("active");
            }
        }

        function getPanelProperties() {
            var panelObj, deviceSize;

            if (!ie8) {
                if (matchMedia("mobile")) {
                    panelObj = createPanelObj(38, adSizeSm, imgSizeSm);
                    deviceSize = 0;
                } else if (matchMedia("tablet")) {
                    if ($(window).height() < 350) {
                        panelObj = createPanelObj(0, adSizeLg, imgSizeLg);
                    } else {
                        panelObj = createPanelObj(60, adSizeLg, imgSizeLg);
                    }
                } else {
                    panelObj = createPanelObj(60, adSizeLg, imgSizeLg);
                }
            }
			else {
				panelObj = createPanelObj(60, adSizeLg, imgSizeLg);
			}

            return panelObj;
        }

        function createPanelObj(imgSpacing, adSize, imgSize) {
            var contentWidth =  $(".content").width(),
                panelWidth,
                number,

                panelObj = {
                    count: 8,
                    imgWidth: 100,
                    midWidth: 1076
                };

            contentWidth = contentWidth >= 1136 ? 1136 : contentWidth;

            panelWidth = contentWidth - imgSpacing;
            number = Math.floor(panelWidth / adSize);
            panelObj.imgWidth = imgSize;

            if (ads.length < number) {
                panelObj.midWidth = ads.length * adSize;
            } else {
                panelObj.midWidth = number * adSize;
            }
            panelObj.count = number;

            return panelObj;
        }

        function setAdCount() {
            var panelProperties = getPanelProperties();

            if (panelProperties.count !== panelCnt) {
                panelCnt = panelProperties.count;
                imageWidth = panelProperties.imgWidth;
                midWidth = panelProperties.midWidth;
                $(".galleryInner").replaceWith(createInnerGallery(panelCnt));
                $(".c-img-container img").css({"width": imageWidth + "px", "height": imageWidth + "px"});
                $(".endAd").parent().parent().parent().nextAll().css({"display": "none"});
            }
        }

        function createCarousel() { // Build the Carousel
            panlObj.galleryHolder = $("<div />").addClass("galleryCntr");
            panlObj.galleryCntr = $("<div />").addClass("galleryWrapper");

            createInnerGallery(noofimages);

            panlObj.galleryCntr.append(panlObj.gallery);

            panlObj.ctrlLeft = ($("<div />").addClass("ctrlCntr c-nav").css("left", "-28px")
                .append($("<span/>").addClass("arrow left-arrow icon-arrow-gallery-left"))
                .append($("<div/>").addClass("prev inactive")));

            panlObj.ctrlRight = ($("<div />").addClass("ctrlCntr c-nav").css("right", "-28px")
                .append($("<span/>").addClass("arrow right-arrow icon-arrow-gallery-right"))
                .append($("<div/>").addClass("next inactive")));

            panlObj.galleryHolder.append(panlObj.galleryCntr)
                .append(panlObj.ctrlLeft)
                .append(panlObj.ctrlRight);

            $("#gallery").append(panlObj.galleryHolder);

            createSeeAll();
            bindEvents();
            
            $("#gallery").css("display","block");
        }

        function createInnerGallery(imgCnt) {
            noofimages = imgCnt;

            panlObj.gallery = $("<div />").addClass("galleryInner");

            panlObj.leftcontainer = $("<div />").addClass("leftContainer").css({"margin-top": "7px"});
            panlObj.leftpnl = $("<div />").addClass("left").css({"width": midWidth, "margin": "0px auto 0px"});
            panlObj.midcontainer = $("<div />").addClass("midContainer").css({"margin-top": "7px"});
            panlObj.midpnl = $("<div />").addClass("mid").css({"width": midWidth, "margin": "0px auto 0px"});
            panlObj.rightcontainer = $("<div />").addClass("rightContainer").css({"margin-top": "7px"});
            panlObj.rightpnl = $("<div />").addClass("right").css({"width": midWidth, "margin": "0px auto 0px"});

            panlObj.leftcontainer.append(panlObj.leftpnl);
            panlObj.midcontainer.append(panlObj.midpnl);
            panlObj.rightcontainer.append(panlObj.rightpnl);

            panlObj.gallery.append(panlObj.leftcontainer)
                .append(panlObj.midcontainer)
                .append(panlObj.rightcontainer);

            createAds();

            return panlObj.gallery;
        }

        function createAds() {
            var leftUl = $("<ul/>"),
                midUl = $("<ul/>"),
                rightUl = $("<ul/>"),
                diff = Math.abs(noofimages - oldNo);

            // Calculates the correct end index position if there is a resize
            if (currentImageIndex === -1) {
                pos = currentImageIndex + 1;
            } else {
                if (noofimages > oldNo) {
                    pos = pos - oldNo;
                } else {
                    pos = currentImageIndex - diff - noofimages;
                }
            }

            if (ads.length > noofimages) {
                for(i = 0; i < noofimages; ++i) {

                    panlObj.leftnodesImages.push($("<a/>").attr({"href": "#"}).
                        append($("<div/>").addClass("c-img-container").
                            append($("<img/>").attr("src", "").css({width: imageWidth + "px", height: imageWidth + "px"}))));

                    if (ads[pos]) {
                        if (ads[pos].title === "endAd") {
                            panlObj.midnodesImages.push($("<a/>").attr({"href": ads[pos].viewPageUrl}).
                                append($("<div/>").append(createEndAd())));
                        } else {
                            panlObj.midnodesImages.push($("<a/>").attr({"href": ads[pos].viewPageUrl}).
                                append($("<div/>").addClass("c-img-container").
                                    append($("<img/>").attr("src", ads[pos].primaryImgUrl).css({width: imageWidth + "px", height: imageWidth + "px"})).
                                    	append($("<div class=\"dContainer\"><div class=\"title\">" + ads[pos].title + "</div><div class=\"price\">" + ads[pos].formattedAmount + "</div></div>"))));
                        }
                    }

                    if (ads[pos + noofimages]) {
                        panlObj.rightnodesImages.push($("<a/>").attr({"href": "#"}).
                            append($("<div/>").addClass("c-img-container").
                                append($("<img/>").attr("src", ads[pos + noofimages].primaryImgUrl).css({width: imageWidth + "px", height: imageWidth + "px"}))));
                    }

                    leftUl.append($("<li>").append(panlObj.leftnodesImages[i]));
                    midUl.append($("<li>").append(panlObj.midnodesImages[i]));
                    rightUl.append($("<li>").append(panlObj.rightnodesImages[i]));

                    pos++;
                }
            } else {
                for(i = 0; i < ads.length; ++i) {
                    if (ads[pos]) {
                        if (ads[pos].title === "endAd") {
                            panlObj.midnodesImages.push($("<a/>").attr({"href": ads[i].viewPageUrl}).
                                append($("<div/>").
                                    append(createEndAd())));
                        } else {
                            panlObj.midnodesImages.push($("<a/>").attr({"href": ads[pos].viewPageUrl}).
                                append($("<div/>").addClass("c-img-container").
                                    append($("<img/>").attr("src", ads[pos].primaryImgUrl).css({width: imageWidth + "px", height: imageWidth + "px"})).
                            			append($("<div class=\"dContainer\"><div class=\"title\">" + ads[pos].title + "</div><div class=\"price\">" + ads[pos].formattedAmount + "</div></div>"))));
                        }

                    }

                    midUl.append($("<li>").append(panlObj.midnodesImages[i]));

                    pos++;
                }
            }

            currentImageIndex = pos;
            oldNo = noofimages;

            panlObj.leftpnl.append(leftUl);
            panlObj.midpnl.append(midUl);
            panlObj.rightpnl.append(rightUl);
        }

        function createSeeAll() {
            var seeAllUrl = window.seeAllUrl,
                seeAllText = window.seeAllText;

            var $a = $("<a>",{
                    "href":seeAllUrl,
                    "target":"top",
                    "class":"sudo-link",
                    "data-o-uri":seeAllUrl
                }).text(seeAllText + " \u003e"),
                seeAll = $("<div>",{
                    "class":"seeAllContainer"
                }).append($a);
            $("#gallery").append(seeAll);
        }

        function bindEvents() {
            $(window).on("resize orientationchange", function(e) {
                handleResize();
            });

            $(".galleryWrapper").on("webkitTransitionEnd transitionend msTransitionEnd oTransitionEnd", panlObj.gallery, function() {transitionAds(panelDirection);});
        }

        function movePanel(direction) {
            panelDirection = direction;
            panlObj.ctrlLeft.off("click");
            panlObj.ctrlRight.off("click");

            var newLeft;

            if (direction < 0 ) { // next (right)
                if (currentImageIndex + noofimages > ads.length &&
                    currentImageIndex >= ads.length) {
                    return;
                }
                if (ie8 || ie9) {
                    newLeft = "-200%"; // current left - 100%
                    animateAds(newLeft);
                } else {
                    turnOnTransition(true);
                    panlObj.gallery.css({left: "-200%"});
                }
            } else {
                if (currentImageIndex - noofimages <= 0 ) {
                    return;
                }
                if (ie8 || ie9) {
                    newLeft = "0%"; // current left + 100%
                    animateAds(newLeft);
                } else {
                    turnOnTransition(true);
                    panlObj.gallery.css({left: "0%"});
                }
            }
        }

        function turnOnTransition(on) {
            if (on) {
                panlObj.gallery.css({
                    "-webkit-transition": "left 0.5s ease-out",
                    "-moz-transition": "left 0.5s ease-out",
                    "-o-transition": "left 0.5s ease-out",
                    "transition": "left 0.5s ease-out"
                });
            } else {
                panlObj.gallery.css({
                    "-webkit-transition": "none",
                    "-moz-transition": "none",
                    "-o-transition": "color 0 ease-in",
                    "transition": "none"
                });
            }
        }

        function animateAds(newLeft) {
            panlObj.gallery.stop().animate({left: newLeft}, 500, function(){ transitionAds(panelDirection); });
        }

        function postLinker($el){
            $el.closest("a").attr({"href": window.dataPostLink,"data-gtm":"pc|PostAdBegin"});
        }

        function transitionAds(panelDirection) {
            turnOnTransition(false);
            panlObj.gallery.css({left: "-100%"});

            var midIndex,
                leftIndex,
                rightIndex,
                vis;

            if (panelDirection < 0) { // next(right)
                // build  visible panel first for better performance
                for (i = 0; i < noofimages; ++i) {
                    midIndex = i + currentImageIndex;
                    if (midIndex < ads.length && midIndex >= 0) {
                        if (ads[midIndex].title === "endAd") {
                            postLinker(panlObj.midnodesImages[i]);
                            panlObj.midnodesImages[i].find("img").replaceWith(createEndAd());
                            panlObj.midnodesImages[i].find(".c-img-container").removeClass("c-img-container");
                            panlObj.midnodesImages[i].find(".dContainer").css("display", "none");
                        } else {
                            panlObj.midnodesImages[i].attr("href", ads[midIndex].viewPageUrl);
                            panlObj.midnodesImages[i].find("img").attr("src", ads[midIndex].primaryImgUrl);
                            panlObj.midnodesImages[i].find(".dContainer").css("display", "block");
                            panlObj.midnodesImages[i].find(".dContainer .title").html(ads[midIndex].title);
                            panlObj.midnodesImages[i].find(".dContainer .price").html(ads[midIndex].formattedAmount);

                        }
                    } else {
                        panlObj.midnodesImages[i].parent().css("display", "none");
                    }
                }
                // then build left and right hidden panels
                for (i = 0; i < noofimages; ++i) {
                    leftIndex = currentImageIndex - noofimages + i;
                    if (leftIndex < ads.length && leftIndex >= 0) {
                        panlObj.leftnodesImages[i].attr("href", ads[leftIndex].viewPageUrl);
                        panlObj.leftnodesImages[i].find("img").attr("src", ads[leftIndex].primaryImgUrl);
                        panlObj.leftnodesImages[i].find(".dContainer").css("display", "block");
                        panlObj.leftnodesImages[i].find(".dContainer .title").html(ads[leftIndex].title);
                        panlObj.leftnodesImages[i].find(".dContainer .price").html(ads[leftIndex].formattedAmount);
                    }

                    rightIndex = currentImageIndex + noofimages + i;
                    if (setRightItemVis(rightIndex,i) && i < panlObj.rightnodesImages.length && rightIndex < ads.length && rightIndex >= 0) {
                        panlObj.rightnodesImages[i].attr("href", ads[rightIndex].viewPageUrl);
                        panlObj.rightnodesImages[i].find("img").attr("src", ads[rightIndex].primaryImgUrl);
                        panlObj.rightnodesImages[i].find(".dContainer").css("display", "block");
                        panlObj.rightnodesImages[i].find(".dContainer .title").html(ads[rightIndex].title);
                        panlObj.rightnodesImages[i].find(".dContainer .price").html(ads[rightIndex].formattedAmount);
                    }
                }
                currentImageIndex = currentImageIndex + noofimages;
                if (nextUrl && currentImageIndex > ads.length - adsRemaining) {
                    getAds(nextUrl);
                } else {
                    setNavigation();
                }

            } else { // prev(left)

                for (i = 0; i < noofimages; ++i) {
                    midIndex = currentImageIndex - 2 * noofimages + i;

                    var midnode =  panlObj.midnodesImages[i];
                    if (midIndex < ads.length && midIndex >= 0 && midnode) {
                        var endAd =  midnode.find(".endAd");
                        if (endAd.length) {
                            if (ads[midIndex].title === "endAd") {
                                midnode.attr("href", ads[midIndex].viewPageUrl);
                                midnode.find("img").attr("src", ads[midIndex].primaryImgUrl);
                            } else {
                                endAd.replaceWith($("<img/>"));
                                midnode.attr("href", ads[midIndex].viewPageUrl);
                                midnode.find("img").attr("src", ads[midIndex].primaryImgUrl);
                                midnode.find("div").first().addClass("c-img-container");
                                midnode.find(".dContainer").css("display", "block");
                                midnode.find(".dContainer .title").html(ads[midIndex].title);
                                midnode.find(".dContainer .price").html(ads[midIndex].formattedAmount);
                            }
                        } else {
                            midnode.attr("href", ads[midIndex].viewPageUrl);
                            midnode.find("img").attr("src", ads[midIndex].primaryImgUrl);
                            midnode.find(".dContainer").css("display", "block");
                            midnode.find(".dContainer .title").html(ads[midIndex].title);
                            midnode.find(".dContainer .price").html(ads[midIndex].formattedAmount);
                        }

                        panlObj.midnodesImages[i].parent().css("display", "block");
                    }
                }

                for (i = 0; i < noofimages; ++i){
                    leftIndex = currentImageIndex - (3 * noofimages) + i;
                    if (panlObj.leftnodesImages[i] && leftIndex < ads.length && leftIndex >= 0) {
                        panlObj.leftnodesImages[i].attr("href", ads[leftIndex].viewPageUrl);
                        panlObj.leftnodesImages[i].find("img").attr("src", ads[leftIndex].primaryImgUrl);
                        panlObj.leftnodesImages[i].find(".dContainer").css("display", "block");
                        panlObj.leftnodesImages[i].find(".dContainer .title").html(ads[leftIndex].title);
                        panlObj.leftnodesImages[i].find(".dContainer .price").html(ads[leftIndex].formattedAmount);
                    }

                    rightIndex = currentImageIndex - noofimages + i;
                    if (panlObj.rightnodesImages[i] && setRightItemVis(rightIndex,i) && i < panlObj.rightnodesImages.length && rightIndex < ads.length && rightIndex >= 0) {
                        panlObj.rightnodesImages[i].attr("href", ads[rightIndex].viewPageUrl);
                        panlObj.rightnodesImages[i].find("img").attr("src", ads[rightIndex].primaryImgUrl);
                        panlObj.rightnodesImages[i].find(".dContainer").css("display", "block");
                        panlObj.rightnodesImages[i].find(".dContainer .title").html(ads[rightIndex].title);
                        panlObj.rightnodesImages[i].find(".dContainer .price").html(ads[rightIndex].formattedAmount);
                    }
                }
                currentImageIndex = currentImageIndex - noofimages;
                setNavigation();
            }
        }
        function setRightItemVis(rightIndex,i){
            // hides/shows last panels items where there are no ads.
            // returns its visiblity because there is no need to update
            // the element if it's hidden.
            var vis = (rightIndex + i > ads.length) ? "none" : "block";
            if(panlObj.rightnodesImages[i]) {
                panlObj.rightnodesImages[i].parent().css({display:vis});
            }
            return vis === "block";
        }
			
		function getAds(url) {
			var request = $.ajax({
				url: url,
				type: "GET",
				dataType: "json"
			});

			request.done(function(msg) {
                var prevUrl, nextUrl;
				if (msg.ads) {
                    for (i = 0; i < msg.ads.length; i++) {
                        ads.push(msg.ads[i]);
                    }
                    $next.removeClass("inactive");
                    $next.addClass("active");
				}
				prevUrl = msg.previousAjaxUrl;
				nextUrl = msg.nextAjaxUrl;
/*
                if (!nextUrl) {
                    ads.push({
                        imgUrl: "#",
                        title: "endAd",
                        url: "#"
                    });
                }
*/

                if (!nextUrl) {
                    ads.push({
                        primaryImgUrl: "#",
                        title: "endAd",
                        viewPageUrl: "#"
                    });
                }
                setNavigation();
			});
		}

        function createEndAd() {
            var div = $("<div/>").addClass("endAd"),
                a = $("<span/>"),
                text = $("<div/>").addClass("postText").text(window.dataPostAdText);
            postLinker(a);

            a.append(text);
            div.append(a);

            return div;
        }

        /* ------------------------------------- */
        /* Begin New functionality for BOLT 2.0 */
        function getAjaxsUrlFromBapiJSON(dataG) {
            var ajaxUrls = { "prev" : null , "next" : null },
                links = dataG.links || null,
                linkObj,
                idx;

            if (links) {
                for (idx = 0; idx < links.length; ++idx) {
                    linkObj = links[idx];
                    if (linkObj.rel.match(/previous/i)) {
                        ajaxUrls.prev = ("/api" + linkObj.href) || "";
                    } else if (linkObj.rel.match(/next/i)) {
                        ajaxUrls.next = ("/api" + linkObj.href) || "";
                    }
                }
            }

            return ajaxUrls;
        }

        function processDataJSON(dataG) {
            var galleryData,
                ajaxUrls;

            dataG = dataG || {};
            galleryData = {
                "ads" : dataG.ads || []
            };

            // Get the prev and next urls
            ajaxUrls = getAjaxsUrlFromBapiJSON(dataG);

            if (dataG.nextAjaxUrl) {
                galleryData.nextAjaxUrl = dataG.nextAjaxUrl;    
            }

            if (dataG.previousAjaxUrl) {
                galleryData.previousAjaxUrl = dataG.previousAjaxUrl;    
            }

            if (ajaxUrls.next) {
                galleryData.nextAjaxUrl = ajaxUrls.next;
            }

            if (ajaxUrls.prev) {
                galleryData.previousAjaxUrl = ajaxUrls.prev;
            }

            return galleryData;
        }

        /* End New functionality for BOLT 2.0 */
        /* ------------------------------------- */

		init();
	});
		
})();
