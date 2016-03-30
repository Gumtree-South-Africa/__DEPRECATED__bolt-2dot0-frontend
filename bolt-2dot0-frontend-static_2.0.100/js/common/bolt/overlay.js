/**
 * Created by moromero on 1/6/14.
 */



// constructor
define("Overlay", [], function(){


	var $overlay,
		$modal;
	var closeSpeed = 'fast';

	function openOverlay(config){

		var opts = {
			modal: true,
			html: "",
			closeOnEsc: true,
			width: "60%",
			height: "50%",
			zIndex: 1000,
			modalBackgroundColor: "rgba(0,0,0,0.5)",
			overlayBackgroundColor: "rgba(255,255,255,0.95)",
			closeable: true,
			speed:'fast'
		};
		closeSpeed = opts.speed;
		if(typeof config === "object")
			$.extend(opts, config);
		else if(typeof config === "string")
			opts.html = config;

		var zIndex = opts.zIndex,
			width = opts.width,
			height = opts.height,
			$window = $(window),
			left, top;

		if(opts.width.toString().indexOf("%") > -1)
			left = Math.round((100 - parseInt(opts.width)) / 2) + "%";
		else
			left = Math.round( ($window.width() - width) / 2);

		if(opts.height.toString().indexOf("%") > -1)
			top = Math.round((100 - parseInt(opts.height)) / 2) + "%";
		else
			top = Math.round( ($window.height() - height) / 2 );

		if(opts.modal != false)
			$modal = $("<div />")	
				.addClass("bolt-overlay-modal")
				.css({
					backgroundColor: opts.modalBackgroundColor,
					backgroundImage: "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAI0lEQVQIW2NkwASSjGhikkD+c2RBsABIEUwQLgATRBEACQIApYEEH/XymTkAAAAASUVORK5CYII=)",
					width: "100%",
					height: "100%",
					position: "fixed",
					zIndex: zIndex++,
					left: 0,
					top: 0
				})
				.appendTo("body");

		$overlay = $("<div />")
			.addClass("bolt-overlay")
			.css({
				position: "fixed",
				background: opts.overlayBackgroundColor,
				"-webkit-border-radius": "5px",
				"-moz-border-radius": "5px",
				borderRadius: "5px",
				"-webkit-box-shadow": "0px 3px 5px rgba(0,0,0,0.25)",
				"-moz-box-shadow": "0px 3px 5px rgba(0,0,0,0.25)",
				boxShadow: "0px 3px 5px rgba(0,0,0,0.25)",
				left: left,
				top: top,
				width: width,
				height: height,
				zIndex: zIndex++
			})
			.html( opts.html )
			.appendTo("body");
		
		if(opts.callback) {
			callback = opts.callback
		}

		if(opts.closeable && opts.closeOnEsc)
			$window.on("keyup", closeOnEscape);

		if(opts.closeable)
			$("body")
				.on("click", ".bolt-overlay-modal", closeOverlay)
				.on("click", ".bolt-overlay", preventClosing);

		return {overlay: $overlay, modal: $modal};
	}



	function closeOverlay(speed){
	    var tspeed = speed != undefined? speed : closeSpeed;
		$(".bolt-overlay,.bolt-overlay-modal").fadeOut(tspeed, function(){
			$(this).remove();
		});

		$(window)
			.off("keyup", closeOnEscape);

		$("body")
			.off("click", ".bolt-overlay-modal", closeOverlay)
			.off("click", ".bolt-overlay", preventClosing);
	}



	function preventClosing(ev){
		ev.stopPropagation();
	}




	function closeOnEscape(ev){
		if(ev.keyCode === 27)
			closeOverlay();
	}



	function BoltOverlay(){
		this.open = openOverlay;
		this.close = closeOverlay;
		return this;
	}


	return BoltOverlay;


});




// get default instance
define("overlay", ["Overlay"], function(Overlay){

	Bolt.Overlay = new Overlay;

	return Bolt.Overlay;

});