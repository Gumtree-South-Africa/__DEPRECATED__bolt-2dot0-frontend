"use strict";

$(function() {
var nextPageUrl,
    showPromotionSlide = false;

$(".owl-carousel").owlCarousel({
    items: 6,
    navigation: true,
    scrollPerPage: true,
    rewindNav: false,
    lazyLoad: true,
    itemsCustom: [
      [0, 2],
      [360, 3],
      [600, 4],
      [800, 5],
      [1024, 6]
    ],
    beforeInit: addInitialSlides,
    afterMove: FetchNextSlides
  });

var carousel = $(".owl-carousel").data("owlCarousel");

function FetchNextSlides() {
    var self = this,
        current = self.currentItem,
        itemsPerPage = self.visibleItems.length;
    if(current >= self.maximumItem - itemsPerPage){
      $(".product-carousel-container").find(".carousel-loading").show();
    
      if(nextPageUrl){
        $.getJSON( nextPageUrl, function( data ) {
          var ads = data.ads;
          $(".product-carousel-container").find(".carousel-loading").hide();
          nextPageUrl = data.nextAjaxUrl;
          if(ads){
            if(showPromotionSlide){
              self.removeItem(self.itemsAmount - 1);  
            }
            for(var i = 0; i < ads.length; i++){
              self.addItem(createSlide(ads[i]));
            }
            if(showPromotionSlide){
              self.addItem(createPromotionSlide());
            }
            self.jumpTo(current);
          }
        });
      }else{
        $(".product-carousel-container").find(".carousel-loading").hide();
      }
    }
}

	function createSlide(slide) {
		/*
	    var image = slide.imgUrl,
	        name = slide.title,
	        price = slide.amount,
	        url = slide.url;
	    */

	    var image = slide.primaryImgUrl,
	        name = slide.title,
	        price = slide.formattedAmount,
	        url = slide.viewPageUrl;

	    return [
	            "<div class=\"product-carousel__slide\">",
	            "<a href=\"" + url + "\">",
	              "<div class=\"product-carousel__image\">",
	                "<img class=\"lazyOwl\" data-src=\"" + image + "\" alt=\"" + name + "\">",
	              "</div>",
	              "<div class=\"product-carousel__body\">",
	                "<div class=\"product-carousel__name\">" + name + "</div>",
	                "<div>",
	                  "<strong>" + price + "</strong>",
	                "</div>",
	              "</div>",
	            "</a>",
	            "</div>"].join("");
	}
	
	function addInitialSlides() {
	    var slides = "",
	    	data = window.adList,
	    	nextPageUrl = data.nextAjaxUrl,
	    	ads = data.ads;
	    
	    //Add a slide for each item in the JSON
	    for(var i=0; i<ads.length; i++){
		      slides += createSlide(ads[i]);
		}
	    
	    if(showPromotionSlide){
	      slides += createPromotionSlide();
	    }

	    $(".owl-carousel").html(slides);
	  }

  
	//Add the 'Publish your ad' slide
	function createPromotionSlide() {
	    return ["<div class=\"product-carousel__slide--ads\">",
	            "<span href=\"\" class=\"product-carousel__ads\" data-o-uri=\"" + window.dataPostLink +"\">",
	            "<span class=\"product-carousel__ads-banner\">",
	              "<span class=\"product-carousel__ads-image\">",
	                "<span class=\"icon-noImage-img\"></span>",
	              "</span>",
	              "<span class=\"product-carousel__ads-text\">Tu anuncio aqu\u00ED</span>",
	            "</span>",
	            "<span class=\"product-carousel__ads-button\">Promueve tu anuncio</span>",
	          "</span>",
	          "<div class=\"product-carousel__separator\"></div>",
	        "</div>"].join("");
	}
});