/* jshint ignore:start */

 // EXIF  class
   
 var debug = false;
 var TiffTags = {
           
		 0x0112 : "Orientation"
 };

 function scaleAndCropImage(img, fileType) {
     var maxLength= 800, QUALITY = 0.9;
     var cropRatio = 800 / 600;
     var originalWidth = img.width; 
     var originalHeight = img.height;//console.log(originalWidth + " " + originalHeight);

     // 90 degrees CW or CCW, flip width and height.
     var $img = $(img);
     var orientation = 0;
     if ( img.exifData && img.exifData.Orientation) {
    	 orientation = img.exifData.Orientation;
     }
     
     switch (orientation) {
         case 5:
         case 6:
         case 7:
         case 8:
             cropRatio = 1 / cropRatio;
             break;
         default:
     }

     // Calculate width and height based on desired X/Y ratio.
     var ret = determineCropWidthAndHeight(cropRatio, originalWidth, originalHeight);
     var cropWidth = ret.width;
     var cropHeight = ret.height;

     // Determine if longest side exceeds max length.
     ret = determineScaleWidthAndHeight(maxLength, cropWidth, cropHeight);
     var scaleWidth = ret.width;
     var scaleHeight = ret.height;
     var scaleRatio = cropWidth / scaleWidth;

     // Crop and scale.
     var x = -1 * (Math.round(((originalWidth - cropWidth) / 2) / scaleRatio));
     var y = -1 * (Math.round(((originalHeight - cropHeight) / 2) / scaleRatio));
     x = Math.min(0, x);
     y = Math.min(0, y);
     var w = Math.round(originalWidth / scaleRatio);
     var h = Math.round(originalHeight / scaleRatio);

     var canvas = document.createElement("canvas");

     switch (orientation) {
         case 5:
         case 6:
         case 7:
         case 8:
             canvas.width = scaleHeight;
             canvas.height = scaleWidth;
             break;
         default:
             canvas.width = scaleWidth;
             canvas.height = scaleHeight;
     }

     var ctx = canvas.getContext("2d");
     if (orientation) {
         // Transform canvas coordination according to specified frame size and orientation.
         transformCoordinate(ctx, orientation, scaleWidth, scaleHeight);
     }

     // For now just a white background, in the future possibly background color based on dominating image color?
     if (isIOS()) ctx.fillStyle = "rgba(255,255,255, 0)";
     ctx.fillRect(0, 0, scaleWidth, scaleHeight);
     ctx.drawImage(img, x, y, w, h);

     // Try to fix IOS6s image squash bug.
     // Test for transparency. This trick only works with JPEGs.
     if (isIOS() && fileType == 'image/jpeg') {
         var transparent = detectTransparency(ctx);
         if (transparent) {
             // Redraw image, doubling the height seems to fix the iOS6 issue.
             ctx.drawImage(img, x, y, w, h * 2.041);
         }
     }

     // Notify listeners of scaled and cropped image.
     //settings.onProcessed && settings.onProcessed(canvas);

     return convertCanvasToBlob(canvas,fileType , QUALITY);

 }
					
function determineCropWidthAndHeight(ratio, width, height) {

    var currentRatio = width / height;
    if (currentRatio != ratio) {
        if (currentRatio > ratio) {
            // Cut x
           if (isIOS() ) { width = height * ratio };
        } else {
            // Cut y
        	if (isIOS() ) { height = width / ratio };
        }
    }

    return {width: Math.round(width), height: Math.round(height)};
}
                
function determineScaleWidthAndHeight(maxLength, width, height) {

    if (width > height) {
        if (width > maxLength) {
            height *= maxLength / width;
            width = maxLength;
        }
    } else {
        if (height > maxLength) {
            width *= maxLength / height;
            height = maxLength;
        }
    }
    return {width: Math.round(width), height: Math.round(height)};
}
               
                
function detectTransparency(ctx) {
    var canvas = ctx.canvas;
    var height = canvas.height;

    // Returns pixel data for the specified rectangle.
    var data = ctx.getImageData(0, 0, 1, height).data;

    // Search image edge pixel position in case it is squashed vertically.
    for (var i = 0; i < height; i++) {
        var alphaPixel = data[(i * 4) + 3];
        if (alphaPixel == 0) {
            return true;
        }
    }
    return false;
}

                
function transformCoordinate(ctx, orientation, width, height) {
    switch (orientation) {
        case 1:
            // nothing
            break;
        case 2:
            // horizontal flip
            ctx.translate(width, 0);
            ctx.scale(-1, 1);
            break;
        case 3:
            // 180 rotate left
            ctx.translate(width, height);
            ctx.rotate(Math.PI);
            break;
        case 4:
            // vertical flip
            ctx.translate(0, height);
            ctx.scale(1, -1);
            break;
        case 5:
            // vertical flip + 90 rotate right
            ctx.rotate(0.5 * Math.PI);
            ctx.scale(1, -1);
            break;
        case 6:
            // 90 rotate right
            ctx.rotate(0.5 * Math.PI);
            ctx.translate(0, -height);
            break;
        case 7:
            // horizontal flip + 90 rotate right
            ctx.rotate(0.5 * Math.PI);
            ctx.translate(width, -height);
            ctx.scale(-1, 1);
            break;
        case 8:
            // 90 rotate left
            ctx.rotate(-0.5 * Math.PI);
            ctx.translate(-width, 0);
            break;
        default:
            break;
    }
}

   				function isCanvasSupported(){
   				  var elem = document.createElement('canvas');
   				  return !!(elem.getContext && elem.getContext('2d'));
   				};

   				
   			 	
   		        function convertCanvasToBlob(canvas, fileType, QUALITY) {
   		            if (canvas.mozGetAsFile) {
   		                // Mozilla implementation (File extends Blob).
   		                return canvas.mozGetAsFile(null, fileType, QUALITY);
   		            } else if (canvas.toBlob) {
   		                // HTML5 implementation.
   		                // https://developer.mozilla.org/en/DOM/HTMLCanvasElement
   		                return canvas.toBlob(null, fileType, QUALITY);
   		            } else {
   		                // WebKit implementation.
   		                // http://stackoverflow.com/questions/4998908/convert-data-uri-to-file-then-append-to-formdata
   		                return createBlobFromDataUri(canvas.toDataURL(fileType, QUALITY));
   		            }
   		        }

   		        /**
   		         * Convert WebKit dataURI to Blob.
   		         */
   		        function createBlobFromDataUri(dataURI) {

   		            // Convert base64/URLEncoded data component to raw binary data held in a string
   		            var splitString = dataURI.split(',');
   		            var splitStringMime = splitString[0];
   		            var splitStringData = splitString[1];

   		            var byteString;
   		            if (splitStringMime.indexOf('base64') >= 0) {
   		                byteString = atob(splitStringData);
   		            } else {
   		                byteString = decodeURIComponent(splitStringData);
   		            }

   		            // separate out the mime component
   		            var mimeString = splitStringMime.split(':')[1].split(';')[0];

   		            // Write the bytes of the string to an ArrayBuffer
   		            var length = byteString.length;
   		            var buf = new ArrayBuffer(length);
   		            var view = new Uint8Array(buf);
   		            for (var i = 0; i < length; i++) {
   		                view[i] = byteString.charCodeAt(i);
   		            }

   		            // Detect if Blob object is supported.
   		            if (typeof Blob !== 'undefined') {
   		                return new Blob([buf], {type: mimeString});

   		            } else {
   		                window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder;
   		                var bb = new BlobBuilder();
   		                bb.append(buf);
   		                return bb.getBlob(mimeString);
   		            }
   		        };

                function fileAPISupport() {
                	
                	return !!(window.File && window.FileList && window.FileReader);
                } 
                
                function supportMultiple() {
                	// lets not do it for safari until we find a solution
                	//if ($.isSafari()) return false;
                	//if ($.isSafari() && !(IsSafariMUSupport())) return false;
                	// do i support FileList API
                	if ($("#file").files && document.getElementById("file").files.length == 0) return false;
                    //do I support input type=file/multiple
                    var el = document.createElement("input");
                    return ("multiple" in el);
                }
                
                 
                // Add thumbnail url by replacing _18 to _14, See EPS server
                function convertThumbImgURL14(url) {
                	var reg = /\_\d*\.JPG/ig;
              	  	return url.replace(reg,"_14.JPG") ;
                };
                
                function convertThumbImgURL18(url) {
                	var reg = /\_\d*\.JPG/ig;
              	  	return url.replace(reg,"_18.JPG") ;
                };
                
                function getThumbImgURL(url) {
                  var result;
                	if (!EPS.IsEbayDirectUL) {
                		result = url.split("?")[0];
                	}
                  else {
                	   // for direct zoom
                	   result = url.split(";")[1];
                  }

                  if (result && result.match(/^http/)) {
                    return result;  // url looks fine
                  }

                  // does not look to suit an url format
                  return;
                };
                
                function extractEPSServerError(respText) {
                	// format, ERROR:ME200
                	var reg = /ERROR\:(\w*)/i;
                	 return respText.replace(reg, "$1");
                };
                
                function getUrlVars(url) {
                    var vars = {};
                    var parts = url.replace(/[?&]+([^=&]+)=([^&]*)/gi,    
                    function(m,key,value) {
                      vars[key] = value;
                    });
                    return vars;
               };
                
                
               function createImgObj(i, urlThumb, urlNormal ) {
                   var imagePlaceHolder = $("#image-place-holder-" + i);
                   $(imagePlaceHolder).css( "background-position-y", "1em");
                   
                   var ul = $("<input class='pThumb' id ='pThumb" + i + "' type='hidden' name='picturesThumb' value=''/><input class='pict' id='pict" + i + "' type='hidden' name='pictures' value=''/>");
                   ul.prependTo(imagePlaceHolder); 
                   
                  $("#thumb-img-" + i).attr("src",urlThumb);
                  $("#pThumb" + i).val(encode_utf8( urlThumb));
            	  $("#pict" + i).val(encode_utf8( urlNormal));
               };
               
               var ExtractURLClass = function(url) {
            	    // extract, url
            	    var normalImageURLZoom = getThumbImgURL(url);

                  if (!normalImageURLZoom) {
                      // not been able to find out a valid url
                      return;
                  }
         	  		
         	  		//zoom url VERSION:2;http://i.ebayimg.com/00/s/NjAwWDgwMA==/z/r84AAOSwE2lTf~HM/$_1.JPG?set_id=8800005007
         	  		
         	  	    // convert to _18.JPG format saved in backend
     	  		 	normalImageURLZoom = convertThumbImgURL18(normalImageURLZoom);
         	  	    
         	  		// convert to _14.JPG thumb format
                   
                    return {
                    	"thumbImage" : convertThumbImgURL14(normalImageURLZoom),
                    	"normal": normalImageURLZoom
                    }
                  
               };
               
               var isProgressEventSupport = (function(){
            	   try {
            		    var xhr = new XMLHttpRequest();

            		    if ('onprogress' in xhr) { 
            		    if ($.isSafari() && !IsSafariMUSupport())  { 
            		    		return false;
            		    	}
            		        return true;
            		    } else {
            		        return false;
            		    }
            		} catch (e) {
            		    return false;
            		}
            	})()

            	// then anywhere:

            	
                
               
				
				 function convertToBinaryFile(dataUrl, img) {
					 var byteString, binaryFile;
			            try {
			                byteString = atob(dataUrl.split(',')[1]);
			                binaryFile =  new BinaryFile(byteString, 0, byteString.length);
			               
			            } catch (e) {
			                if (debug) console.log("something went wrong");
			            };
			            return binaryFile;
			    };
			    
			    function BinaryFile(strData, iDataOffset, iDataLength) {
			        var data = strData;
			        var dataOffset = iDataOffset || 0;
			        var dataLength = 0;

			        this.getRawData = function () {
			            return data;
			        };

			        if (typeof strData == "string") {
			            dataLength = iDataLength || data.length;

			            this.getByteAt = function (iOffset) {
			                return data.charCodeAt(iOffset + dataOffset) & 0xFF;
			            };

			            this.getBytesAt = function (iOffset, iLength) {
			                var aBytes = [];

			                for (var i = 0; i < iLength; i++) {
			                    aBytes[i] = data.charCodeAt((iOffset + i) + dataOffset) & 0xFF
			                }


			                return aBytes;
			            }
			        } else if (typeof strData == "unknown") {
			            dataLength = iDataLength || IEBinary_getLength(data);

			            this.getByteAt = function (iOffset) {
			                return IEBinary_getByteAt(data, iOffset + dataOffset);
			            };

			            this.getBytesAt = function (iOffset, iLength) {
			                return new VBArray(IEBinary_getBytesAt(data, iOffset + dataOffset, iLength)).toArray();
			            }
			        }

			        this.getLength = function () {
			            return dataLength;
			        };

			        this.getSByteAt = function (iOffset) {
			            var iByte = this.getByteAt(iOffset);
			            if (iByte > 127)
			                return iByte - 256;
			            else
			                return iByte;
			        };

			        this.getShortAt = function (iOffset, bBigEndian) {
			            var iShort = bBigEndian ?
			                (this.getByteAt(iOffset) << 8) + this.getByteAt(iOffset + 1)
			                : (this.getByteAt(iOffset + 1) << 8) + this.getByteAt(iOffset);
			            if (iShort < 0)
			                iShort += 65536;
			            return iShort;
			        };

			        this.getSShortAt = function (iOffset, bBigEndian) {
			            var iUShort = this.getShortAt(iOffset, bBigEndian);
			            if (iUShort > 32767)
			                return iUShort - 65536;
			            else
			                return iUShort;
			        };

			        this.getLongAt = function (iOffset, bBigEndian) {
			            var iByte1 = this.getByteAt(iOffset),
			                iByte2 = this.getByteAt(iOffset + 1),
			                iByte3 = this.getByteAt(iOffset + 2),
			                iByte4 = this.getByteAt(iOffset + 3);

			            var iLong = bBigEndian ?
			                (((((iByte1 << 8) + iByte2) << 8) + iByte3) << 8) + iByte4
			                : (((((iByte4 << 8) + iByte3) << 8) + iByte2) << 8) + iByte1;
			            if (iLong < 0)
			                iLong += 4294967296;
			            return iLong;
			        };

			        this.getSLongAt = function (iOffset, bBigEndian) {
			            var iULong = this.getLongAt(iOffset, bBigEndian);
			            if (iULong > 2147483647)
			                return iULong - 4294967296;
			            else
			                return iULong;
			        };

			        this.getStringAt = function (iOffset, iLength) {
			            var aStr = [];

			            var aBytes = this.getBytesAt(iOffset, iLength);
			            for (var j = 0; j < iLength; j++) {
			                aStr[j] = String.fromCharCode(aBytes[j]);
			            }
			            return aStr.join("");
			        };

			        this.getCharAt = function (iOffset) {
			            return String.fromCharCode(this.getByteAt(iOffset));
			        };

			        this.toBase64 = function () {
			            return window.btoa(data);
			        };

			        this.fromBase64 = function (strBase64) {
			            data = window.atob(strBase64);
			        }
			    };
				
				
		       
               
               function findEXIFinJPEG(file) {
                   if (file.getByteAt(0) != 0xFF || file.getByteAt(1) != 0xD8) {
                       return false; // not a valid jpeg
                   }

                   var offset = 2,
                       length = file.getLength(),
                       marker;

                   while (offset < length) {
                       if (file.getByteAt(offset) != 0xFF) {
                           if (debug)
                               console.log("Not a valid marker at offset " + offset + ", found: " + file.getByteAt(offset));
                           return false; // not a valid marker, something is wrong
                       }

                       marker = file.getByteAt(offset + 1);

                       // we could implement handling for other markers here, 
                       // but we're only looking for 0xFFE1 for EXIF data

                       if (marker == 22400) {
                           if (debug)
                               console.log("Found 0xFFE1 marker");

                           return readEXIFData(file, offset + 4, file.getShortAt(offset + 2, true) - 2);

                           // offset += 2 + file.getShortAt(offset+2, true);

                       } else if (marker == 225) {
                           // 0xE1 = Application-specific 1 (for EXIF)
                           if (debug)
                               console.log("Found 0xFFE1 marker");

                           return readEXIFData(file, offset + 4, file.getShortAt(offset + 2, true) - 2);

                       } else {
                           offset += 2 + file.getShortAt(offset + 2, true);
                       }

                   }

               }


   function readTags(file, tiffStart, dirStart, strings, bigEnd) {
       var entries = file.getShortAt(dirStart, bigEnd),
           tags = {},
           entryOffset, tag,
           i;

       for (i = 0; i < entries; i++) {
           entryOffset = dirStart + i * 12 + 2;
           tag = strings[file.getShortAt(entryOffset, bigEnd)];
           if (!tag && debug)
               console.log("Unknown tag: " + file.getShortAt(entryOffset, bigEnd));
           if (tag && tag === "Orientation") { 
           		tags[tag] = readTagValue(file, entryOffset, tiffStart, dirStart, bigEnd);
           }
       }
       return tags;
   }


   function readTagValue(file, entryOffset, tiffStart, dirStart, bigEnd) {
       var type = file.getShortAt(entryOffset + 2, bigEnd),
           numValues = file.getLongAt(entryOffset + 4, bigEnd),
           valueOffset = file.getLongAt(entryOffset + 8, bigEnd) + tiffStart,
           offset,
           vals, val, n,
           numerator, denominator;

       switch (type) {
           case 1: // byte, 8-bit unsigned int
       case 7: // undefined, 8-bit byte, value depending on field
           if (numValues == 1) {
               return file.getByteAt(entryOffset + 8, bigEnd);
           } 

       case 2: // ascii, 8-bit byte
           offset = numValues > 4 ? valueOffset : (entryOffset + 8);
           return file.getStringAt(offset, numValues - 1);

       case 3: // short, 16 bit int
           if (numValues == 1) {
               return file.getShortAt(entryOffset + 8, bigEnd);
           }

       case 4: // long, 32 bit int
           if (numValues == 1) {
               return file.getLongAt(entryOffset + 8, bigEnd);
           } 

       case 5:	// rational = two long values, first is numerator, second is denominator
           if (numValues == 1) {
               numerator = file.getLongAt(valueOffset, bigEnd);
               denominator = file.getLongAt(valueOffset + 4, bigEnd);
               val = new Number(numerator / denominator);
               val.numerator = numerator;
               val.denominator = denominator;
               return val;
           } 

       case 9: // slong, 32 bit signed int
           if (numValues == 1) {
               return file.getSLongAt(entryOffset + 8, bigEnd);
           }
       case 10: // signed rational, two slongs, first is numerator, second is denominator
               if (numValues == 1) {
                   return file.getSLongAt(valueOffset, bigEnd) / file.getSLongAt(valueOffset + 4, bigEnd);
               } 
       }
   }


   function readEXIFData(file, start) {
       if (file.getStringAt(start, 4) != "Exif") {
       if (debug)
           console.log("Not valid EXIF data! " + file.getStringAt(start, 4));
       return false;
   }

   var bigEnd,
       tags, tag,
       exifData, gpsData,
       tiffOffset = start + 6;

   // test for TIFF validity and endianness
   if (file.getShortAt(tiffOffset) == 0x4949) {
       bigEnd = false;
   } else if (file.getShortAt(tiffOffset) == 0x4D4D) {
       bigEnd = true;
   } else {
       if (debug)
           console.log("Not valid TIFF data! (no 0x4949 or 0x4D4D)");
       return false;
   }

   if (file.getShortAt(tiffOffset + 2, bigEnd) != 0x002A) {
       if (debug)
           console.log("Not valid TIFF data! (no 0x002A)");
       return false;
   }

   if (file.getLongAt(tiffOffset + 4, bigEnd) != 0x00000008) {
       if (debug)
           console.log("Not valid TIFF data! (First offset not 8)", file.getShortAt(tiffOffset + 4, bigEnd));
           return false;
       }

       tags = readTags(file, tiffOffset, tiffOffset + 8, TiffTags, bigEnd);

       return tags;
   }

/* jshint ignore:end */