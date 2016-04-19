/* jshint ignore:start */
	var allowedUploads = 4;
		    $( document ).ready(function() {
		    	$( ".img-box" ).each(function(i) {
		    		imageUploads.addDuringPreview(i);
				});
		     });

		    Array.prototype.remove = function(from, to) {
		    	  var rest = this.slice((to || from) + 1 || this.length);
		    	  this.length = from < 0 ? this.length + from : from;
		    	  return this.push.apply(this, rest);
		    };
			// Listen for event
			$(window).on('showPostBtn', function(e){
				$(".post-ad-btn-container").css("opacity", "1");
				$('#postSubmit').attr('disabled' , false);
				$('#postPreview').attr('disabled' , false);
				$("#uploading").hide();
			});

			function resetForm(name) {
				if ($(name).doesExist()) {
					$(name).get(0).reset();
				}
			};

			var CpsImage = (function(){
				var gif = "gif", jpeg = "jpeg", jpg = "jpg", png = "png", bmp = "bmp";

				var getFileExt = function(f) {
					var fn = f.toLowerCase();
					return fn.substring((Math.max(0, fn.lastIndexOf(".")) || fn.length) + 1);
				};

				return {
					isSupported:function(f){
						var ext = getFileExt(f);
						return ext === gif || ext === jpeg || ext === jpg || ext === png || ext === bmp ? true : false;
					},
					getFileExt:function(f){
						return getFileExt(f);
					}
				}

			})();




				var featuredImage = function() {

					$("#thumb-nails").on("click", ".img-box", function(e){
						var target = $( e.target );
						if (target.is("div") && $(this).hasClass("icon-remove-gray")) return;
						imageUploads.removeClassFeatured();
						$(this).insertBefore($("#image-place-holder-0"));
						imageUploads.resetThumbDOM();
						imageUploads.addClassFeatured();
					});

				};

				var removeTitleFirstEle = function(index) {
					if ( !isDnDElement() && (index != 0 )  ) {
						return 'title="' + l18n.clickFeatured + '"';
					} else if (index != 0 ) {
						return 'title="' + l18n.dragToReorder + '"';
					}
				};
				// new class

				var imageUploads = (function(){

					var images = new Array(), urls = new Array();

					// reset the dome when thumb element is removed.
					function resetThumbDOM() {
						$( ".img-box" ).each(function(i) {
							  $( this ).attr("id", "image-place-holder-" + i);
							  $(this).find(".thumb").attr("id", "thumb-img-" + i);
							  $(this).find(".upload-status").attr("id", "upload-status-" + i);
							  $(this).find(".progress").attr("id", "progress-" + i);
							  $(this).find(".percents").attr("id", "percents-" + i);
							  $(this).find(".uploading").attr("id", "file-upload-" + i);
							  $(this).find(".pThumb").attr("id", "pThumb" + i);
							  $(this).find(".pict").attr("id", "pict" + i);
						});
					};

					return {
						add:function (l) {

							var html = "",  total = images.length;
							if (total == allowedUploads - 1){
								//case: to hide camera icon
								$('.uploadWrapper').addClass('hiddenElt');
							}
							else{
								if(total > allowedUploads -1){
									return false;
								}
							}
							for(var i=total; i<l+total;i++) {
								var index = i, title = removeTitleFirstEle(index);

								var htmlThumb = '<li draggable="true" class="img-box" id="image-place-holder-' + index + '" ' + title + ' id="img-' + index + '">'
			                				+ '<div class="icon-remove-gray"></div>'
			                				+ '<img class="thumb" id="thumb-img-' + index + '"  width="64px" height="64px" src="" />'
			                				+ '<ul id="upload-status-' + index + '" class="upload-status">'
					 						+ '<li>'
					 						+ '<div id="progress-cnt-' + index + '" class="progress-holder">'
					 						+ '<div id="progress-' + index + '" class="progress"></div>'
					 						+ '</div>'
					 						+ '<span id="percents-' + index + '" class="percents"></span>'
					 						+ '</li>'
					 						+ '<li>'
				 							+ '<div class="uploading" id="file-upload-' + index + '"></div>'
				 							+ '</li>'
				 							+ '</ul>'
				 							+ '</li>';

								images.push(index);
								html = html + htmlThumb;
								$("#thumb-nails").append(htmlThumb);
								dragAndDropElements.init("image-place-holder-"+i);
							};

		                	this.addClassFeatured();
		                	if (!isDnDElement()) {
		                		$(".img-box").css("cursor", "pointer");
		                	} else {
		                		firefoxStopImageEleDrag();
		                	}
		                	return true;
		                },

		                remove:function(i) {
		                	if (isNumber(i)) {
		                		$("#image-place-holder-" + i).remove();
		                		images.pop();
		                		urls.remove(i);
												$('#thumb-nails').next('.uploadWrapper').removeClass('hiddenElt');
		                	}
		                	resetThumbDOM();
		                	// hightlight
							imageUploads.addClassFeatured();
		                },

		                count:function() {
		                	return images.length;
		                },
		                setURL:function(i, u) {
		                	urls.push(u);
		                },
		                getURL:function(i) {
		                	return urls[i];
		                },
		                addDuringPreview:function(i){
		                	images.push(i);
		                },
		                resetThumbDOM: function() {
		                	resetThumbDOM();
		                },
		                addClassFeatured:function() {
		                	$("#image-place-holder-0").addClass("featured");
		                	if (!$("#featuredImage").doesExist()) {
		                		$("#image-place-holder-0").append("<div id='featuredImage'>" + l18n.imageFeatured + "</div>");
		                	}
		                },
		                removeClassFeatured:function() {
		                	$("#image-place-holder-0").removeClass("featured");
		                	$("#featuredImage").remove();
		                }
					}
				})();



                // IE hack
                var cloneInputFileField = function(selectThumb) {
                	// work around for IE
					// Clone the "real" input element
					var real = $(selectThumb);
					var cloned = real.clone(true);

					// Put the cloned element directly after the real element
					// (the cloned element will take the real input element's place in your UI
					// after you move the real element in the next step)
					real.hide();
					real.value = "";
					cloned.insertAfter(real);
					$(real).remove();

                };


                /// Multiple images upload



                function loadData(i, file) {

            		var formData = new FormData();
            		// direct upload via EPS proxy
            		if (!EPS.IsEbayDirectUL) {
            			formData.append("s", "1C5000");
            			formData.append("r", "0");
                   	    formData.append("pltfrm", "bolt");
            		} else {
            			// direct upload to zoom
            			formData.append("s", "Standard");
            			//formData.append("wm", "USER,ICON" );
            			formData.append("aXRequest", "2");
            		}

               	  	formData.append("v", "2");
               	  	formData.append("b", "18");
               	  	formData.append("n", "g");
               	  	formData.append("a", EPS.token);

			  	  	formData.append("u", file);
			  	  	formData.append("rqt", $.now());
			  	  	formData.append("rqis", file.size);

				  	var xhr = new XMLHttpRequest();
	            	xhr.open('POST', EPS.url, true);
	            	xhr.responseType = 'text';
	            	xhr.bCount = i;
	            	xhr.upload.bCount = i;
	            	xhr.fileSize = file.size;

	            	$("#filesize-" + i).html((file.size / 1024).toFixed(0));

          	        xhr.upload.progress = $("#progress-" + i);
          	        xhr.upload.percents = $("#percents-" + i);

              	  	xhr.onload = function(e) {
	              	  	e.stopPropagation();
					    e.preventDefault();

					    var i = this.bCount;
                        var url;
                        var statusOk = (this.status == 200);

                        // try to extract the url and figure out if it looks like to be valid
                        if (statusOk) {
                            url = ExtractURLClass(this.response);
                            if (!url) {
                                // url is not reconized => consider the download in error
                                statusOk = false;
                                // console.log("cannot extract from response given by EPS  => " + this.response);
                            }
                        }

                        if (!statusOk) {
					    	UploadMsgClass.failMsg(i);
                        }

	              	  	if (this.readyState == 4 && statusOk) {

	              	  		var url = ExtractURLClass(this.response);

	              	  		// any errors don't do anything after display error msg
		              	  	if (!url) {
		         	  			var error = extractEPSServerError(this.response);
		         	  			UploadMsgClass.translateErrorCodes( i, error);
		         	  			return;
		         	  		};

	              	  	 // add the image once EPS returns the uploaded image URL
	                        createImgObj(this.bCount, url.thumbImage, url.normal );

	                        $("#progress-" + this.bCount).css("width","100%");
	                 	    $("#percents-" + this.bCount).html("100%");

	                 		UploadMsgClass.successMsg(i);
	                 	 }

	              	  };

	              	  xhr.onabort = function(e) {

	              	  };


	              	 xhr.upload.addEventListener("progress", function (event) {
	              		var i = this.bCount;

	              	    if (event.lengthComputable) {
	              	      this.percents.html(" " + ((event.loaded / event.total) * 100).toFixed() + "%");

	              	      // display image from client
	              	      if (event.loaded == event.total) {
	              	        	$("#thumb-img-" + i).attr("src",imageUploads.getURL(i));
	              	      }
	              	    }
	              	    else {
	              	    	UploadMsgClass.failMsg(i);
	              	    }
	              	 }, false);

          	  		 xhr.send(formData);  // multipart/form-data
			};

			function prepareForImageUpload(i, file) {

            	$("#upload-status-" + i).show();
            	UploadMsgClass.loadingMsg(i);

			 	var mediaType = CpsImage.isSupported(file.name);

			    if (!mediaType) {
			    	UploadMsgClass.translateErrorCodes( i, "FF001"); // invalid file type
			    	return;
			    };

                var reader = null, isResizing = false;

                var img = new Image();

          		if (window.FileReader) {
          			UploadMsgClass.resizing(i);

          			reader = new FileReader();

                 	reader.onload = (function(img, file) {

                 		return function(e){
                 			var dataUrl = e.target.result;


	                 		img.onload = function() {
	                 	    	var resizedImageFile = scaleAndCropImage(this, file.type);
     							loadData(i, resizedImageFile);
	                		};

	                		window.URL = window.URL || window.webkitURL || false;
			                var imageUrl = URL.createObjectURL(file);
	                		img.src = imageUrl;//window.URL.createObjectURL(blob);

	                		if (file.type === 'image/jpeg') {
		                 		var binaryFile = convertToBinaryFile(dataUrl);
		                 		img.exifData = findEXIFinJPEG(binaryFile);
		                 	};

		                 	imageUploads.setURL(i, img.src);
		                 	UploadMsgClass.loadingMsg(i);

                 		};
          			})(img, file);

          			reader.readAsDataURL(file);
				}else {
	                window.URL = window.URL || window.webkitURL || false;
	                var imageUrl = URL.createObjectURL(file);
	                img.onload = function() {
                 	    	var resizedImageFile = scaleAndCropImage(this, file.type);
 							loadData(i, resizedImageFile);
                	};
	                img.src = imageUrl;
	            }
			};

            function html5Upload(evt) {
            	// drag and drop
            	 var uploadedFiles = evt.target.files || evt.dataTransfer.files;
            	 var totalFiles = uploadedFiles.length, prvCount = imageUploads.count();

            	 // if user
            	 if ( imageUploads.count() != allowedUploads && totalFiles == 1) {
            		// create image place holders
                	 imageUploads.add(totalFiles);
                	 UploadMsgClass.loadingMsg(imageUploads.count() - 1); //UploadMsgClass(upDone).fail()
            		 prepareForImageUpload(imageUploads.count() - 1, uploadedFiles[0]);
            	 } else {

            		 if (prvCount === allowedUploads) return;
            		 // create image place holders
            		 var currTotal = imageUploads.count();

            		 if (currTotal === 0) {
            			 if (totalFiles > allowedUploads) {
            				 imageUploads.add(allowedUploads);
            			 } else {
            				 imageUploads.add(totalFiles);
            			 }

            		 } else if (currTotal > 0 && currTotal <=  allowedUploads) {
            			 var emptyCells = allowedUploads - currTotal;

            			 if (totalFiles < emptyCells) {
            				 imageUploads.add(totalFiles);
            			 } else {
            				 imageUploads.add(emptyCells);
            			 }
            		 }

            		 for (var i = 0, file; file = uploadedFiles[i]; i++) {
	               		 if (prvCount == allowedUploads) return;
	               		 UploadMsgClass.loadingMsg(prvCount);
	               		 prepareForImageUpload(prvCount, file);
	               		 prvCount= prvCount + 1;

            	  	 } // end for
            	 }
            };


            	function uploadNoneHtml5(fileEle) {

            		var count = imageUploads.count();
            		if (count === allowedUploads) return;

            		imageUploads.add(1);


            	    // hide progress bar
            	    $(".progress-holder").hide();

            	    var i = imageUploads.count() - 1;

            	    $("#upload-status-" + i).show();

            	    UploadMsgClass.loadingMsg(i);

            	    $("#file-upload-"+ i).css("margin-top", "1.4em");

					var fname = $(fileEle).val(),  mediaType = CpsImage.isSupported(fname);


				    var epsForm = {
				    	action: EPS.url,
				    	id : "epsForm" + count,
				    	fieldNames : [
					    	              {
					    					name : "s",
					    					value :  !EPS.IsEbayDirectUL ? "1C5000" :  "Standard"
					    				  },
					    				  {
						    					name : "v",
						    					value : "2"
						    			  },
						    			  {
						    					name :"b",
						    					value : "18"
						    			  },
						    			  {
						    					name :"n",
						    					value : "g"
						    			  },
						    			  {
						    					name : "a",
						    					value : EPS.token
						    			  },
						    			  {
						    				   name : "pltfrm",
						    				   value:"bolt"
						    			  },
						    			  {
						    				   name : "rqt",
						    				   value: $.now()
						    			  }
				    				  ]

				    };

					var iframe = $('<iframe />', {
					    name: 'eps-frame-' + count,
					    id:   'eps-frame-' + count,
					    style: 'position:absolute;left:-10000px',
					    src: "about:blank"
					});

					if ($("#eps-frame" + count)) {
						iframe.appendTo('body');
						// Add the iframe with a unique name
					}


					// work around for IE 9
					// Clone the "real" input element
					var real = $("#file");
					var cloned = real.clone(true);

					// Put the cloned element directly after the real element
					// (the cloned element will take the real input element's place in your UI
					// after you move the real element in the next step)
					real.hide();
					real.value = "";
					cloned.insertAfter(real);

				    $('<form style="position:absolute;left:-10000px" method="post" action="' + epsForm.action
							+ '" name="' + epsForm.id + '" id="' + epsForm.id
							+ '" target="eps-frame-' + count
							+ '" enctype="multipart/form-data">'
							+ '<input type="hidden" name="s" value="' + epsForm.fieldNames[0].value
							+ '"/><input type="hidden" name="v" value="'
							+ epsForm.fieldNames[1].value + '"/>'
							+ '<input type="hidden" name="b" value="'
							+ epsForm.fieldNames[2].value
							+ '"><input type="hidden" name="n" value="k"/><input type="hidden" name="pltfrm" value="bolt"/><input type="hidden" name="rqt" value="' + $.now() + '"/>'
							+ '<input type="hidden" name="a" value="'
							+ epsForm.fieldNames[4].value + '"/>' + '</form>').append($("#file")).appendTo('body');

				   	$("#" + epsForm.id).submit();
            	};

				$(document).ready(function() {
					if ($.isSafari() && !IsSafariMUSupport() && !isIOS()) { $("#file").removeAttr("multiple");}

					// hightlight
					imageUploads.addClassFeatured();

					//register elements for drag and drop
					if (isDnDElement()) {
						dragAndDropElements.initAll();
					} else {
						featuredImage();
					};

					$("#thumb-nails > li").each( function(index) {
						if ( !isDnDElement() && (index != 0 )  ) {
							$(this).attr("title", l18n.clickFeatured);
						} else if (index != 0 ) {
							$(this).attr('title', l18n.dragToReorder);
						}
					});


					if(isProgressEventSupport === true){
	            	    $(".upload-status").show();
	            	};
					// some devices doesn't support file upload.
					if (!isFileInputSupported) {
						$("#upload-btn").hide();
						$("#or").hide();
						$("#dndArea").hide();
						$("#dnd-cnt").css("float", "left");
						$("#dnd").show();
					};

					if (window.addEventListener) dragAndDrop();

					// on select file
					$('#postForm').on("change", "#fileUpload", function(evt) {
							var  whichEleClicked = 0, imgHolderEle = "";

							evt.stopImmediatePropagation();
							// get img-box

							// multiple image upload

							// lets only do if there is support for multiple
							if (isCORS() && supportMultiple() && !isBlackBerryCurve() && fileAPISupport()) {
								html5Upload(evt);
							} else {
								$("#fileUpload").removeAttr("multiple");
								uploadNoneHtml5(this);
							}
					});


					$("#postForm").on("click", ".icon-remove-gray",  function(evt) {
						evt.stopImmediatePropagation();
						 var i = parseInt($($(this).parents(".img-box")).attr("id").split("-")[3]);
						 if (isNumber(i)) {
						    imageUploads.remove(i);
	                        // Trigger an event to indicate that an image was removed
	                       // $('#postForm').trigger("removedImage", {});

						 }
					});

				});

/* jshint ignore:end */
