/* jshint ignore:start */
// class drop
				
			var dragAndDrop = function(){
				
				var dropbox = document.getElementById("dnd"); 
				
					function defaults(e){
				       e.stopPropagation();  
				       e.preventDefault();  
					};
				    function dragenter(e) {  
					   $(this).addClass("active");
					   defaults(e);
					} ; 
				      
				    function dragover(e) { 
				       $(this).removeClass("active");
					   defaults(e);
					   return false;
				    } ; 
				    function dragleave(e) {  
					   $(this).removeClass("active");
					   defaults(e);
				    };  

				    function drop(e) {  
					   $(this).removeClass("active");
					   defaults(e);
					   html5Upload(e);
				    };
				    
				    
				    function dragEnd(e) { 
				    	 defaults(e);
				    	return false;
				    };
				if ( dropbox) {
					dropbox.addEventListener("dragenter", dragenter, false);  
					dropbox.addEventListener("dragleave", dragleave, false);  
					dropbox.addEventListener("dragover", dragover, false);  
					dropbox.addEventListener("drop", drop, false);  
					dropbox.addEventListener("dragEnd", dragEnd, false);  
				};
				
				
			};
				
				function defaults(e){
			       e.stopPropagation();  
			       e.preventDefault();  
			    };

				
				var firefoxStopImageEleDrag = function() {
					jQuery.browser.firefox = /firefox/.test(navigator.userAgent.toLowerCase());
					if (!jQuery.browser.firefox) return;
					
					
					 var images = document.querySelectorAll('.img-box img');
						
						function dStrart(e) { defaults(e)}
						function dEnter(e) {defaults(e) }
						function dOver(e) { defaults(e) }
						function dLeave(e) { defaults(e) }
						function dDrop(e) { defaults(e)}
						function dEnd(e) { defaults(e) }
						
						
						[].forEach.call(images, function(image) {
							image.addEventListener('dragstart', dStrart, false);
							image.addEventListener('dragenter', dEnter, false);
							image.addEventListener('dragover', dOver, false);
							image.addEventListener('dragleave', dLeave, false);
							image.addEventListener('drop', dDrop, false);
							image.addEventListener('dragend', dEnd, false);
						});
					
				};
				
				
				var dragAndDropElements = function() {
						var dragSrcEl = null;
						jQuery.browser = {};
						jQuery.browser.msie = /msie/.test(navigator.userAgent.toLowerCase());
						
						function handleDragOver(e) {
						  if (e.preventDefault) {
						    e.preventDefault(); // Necessary. Allows us to drop.
						  }

						  e.dataTransfer.dropEffect = 'move';  
						  this.classList.add('over');

						  return false;
						}

						function handleDragEnter(e) {
						  // this / e.target is the current hover target.
						  this.classList.add('over');
						}

						function handleDragLeave(e) {
						  this.classList.remove('over');  // this / e.target is previous target element.
						}

						function handleDragStart(e) {
							  // Target (this) element is the source node.
							  //this.style.opacity = '0.4';

							  dragSrcEl = this;

							  e.dataTransfer.effectAllowed = 'move';
							  
							  if (jQuery.browser.msie) {
								  e.dataTransfer.setData('text', this.innerHTML);
							    } else {
							    	e.dataTransfer.setData('text/html', this.innerHTML);
							    }
							  
						};
						
						function handleDrop(e) {
							  // this/e.target is current target element.

							  if (e.stopPropagation) {
							    e.stopPropagation(); // Stops some browsers from redirecting.
							  }

							  // Don't do anything if dropping the same column we're dragging.
							  if (dragSrcEl != this && this.innerHTML != null) {
							    // Set the source column's HTML to the HTML of the column we dropped on.
							    dragSrcEl.innerHTML = this.innerHTML;
							    
							    if (jQuery.browser.msie) {
							    	this.innerHTML = e.dataTransfer.getData('text');
							    } else {
							    	this.innerHTML = e.dataTransfer.getData('text/html');
							    	
							    }
							    
							  };
							  
							  var cols = document.querySelectorAll('.img-box');

							  [].forEach.call(cols, function (col) {
								    col.classList.remove('over');
							  });
							  this.style.opacity = '1';
							  imageUploads.resetThumbDOM();
							  
							  $("#featuredImage").remove();
							  
			                 imageUploads. addClassFeatured();
			                 

							  return false;
						};
						
						function handleDragEnd(e) {
							  // this/e.target is the source node.
							 if (e.stopPropagation) {
								    e.stopPropagation(); // Stops some browsers from redirecting.
							 }
							  
							 firefoxStopImageEleDrag();
						};
						
						var cols = document.querySelectorAll('.img-box');
						
						return {
							initAll:function() {
								if (isDnDElement()) {
									[].forEach.call(cols, function(col) {
										  col.addEventListener('dragstart', handleDragStart, false);
										  col.addEventListener('dragenter', handleDragEnter, false);
										  col.addEventListener('dragover', handleDragOver, false);
										  col.addEventListener('dragleave', handleDragLeave, false);
										  col.addEventListener('drop', handleDrop, false);
										  col.addEventListener('dragend', handleDragEnd, false);
										  
										  // mobile devices has no support for elements drag and drop
										  //col.addEventListener("touchstart", handleDragStart, false);
										  //col.addEventListener("touchend", handleDrop, false);
										 // col.addEventListener("touchcancel", handleCancel, false);
										 // col.addEventListener("touchleave", handleDragEnd, false);
										 // col.addEventListener("touchmove", handleDragOver, false);

										});
									
									firefoxStopImageEleDrag();

								}
							},
							
							init:function(ele) {
								if (isDnDElement()) {
									var col = document.getElementById(ele);
									  col.addEventListener('dragstart', handleDragStart, false);
									  col.addEventListener('dragenter', handleDragEnter, false);
									  col.addEventListener('dragover', handleDragOver, false);
									  col.addEventListener('dragleave', handleDragLeave, false);
									  col.addEventListener('drop', handleDrop, false);
									  col.addEventListener('dragend', handleDragEnd, false);

								}
								
							}
						};
				}();

/* jshint ignore:end */