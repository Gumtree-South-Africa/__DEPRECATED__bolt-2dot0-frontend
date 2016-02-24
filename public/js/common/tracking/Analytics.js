
$(function(){

	var SUPPORTED_EVENTS = ["click", "onfocus"];
    var EVENT_NAMESPACE = ".AnalyticsGTM";
    var GTM_ELEMENT_SELECTOR = '[data-gtm]:not([data-gtm=""])';

    function _init(){

        // namespaced event selector "click.AnalyticsGTM change.AnalyticsGTM"
        var supported = $.map(SUPPORTED_EVENTS, function(v,i){
            return v + EVENT_NAMESPACE;
        }).join(" ");

        $('body')
         .off(supported)
         .on(supported,GTM_ELEMENT_SELECTOR,analyticsTrackingEventHandler);
        
        $elem = $(GTM_ELEMENT_SELECTOR);
       
      
    }

    function analyticsTrackingEventHandler(e){
    var $currenttarget = $(e.currentTarget);
         var s = $currenttarget.data("gtm") || "",data = s.split("|");
       
       //data[0]- event type( npc=non page change event,pc=page change event)
       //data[1]- action
       //data[2]-[dataLayer Field] :key-  any field in the dataLayer that requires updating for use with the event (e.g. a.id for advert id)
       //data[3]- [dataLayer Field]:value
      

        $currenttarget.removeAttr("data-gtm"); // to make sure that tracking happens only once.  
        if(typeof dataLayer != "undefined"){
          if(data[0] == "pc"){
            trackPageChangeEvent(data,e);
          }else{
            trackNonPageChangeEvent(data);
          }
        }
    }
  
    //For page change event , we need to make sure that tracking is done and also we are not missing other event handlers attached to the element.
    //For that , exclude 'data-gtm' elements from other event handlers initially. This handler will trigger the 'event' again. ( We are removing the 'data-gtm' attribute 
    //from the element.
   function trackPageChangeEvent(data,e){
      var trackingDone=false,$currenttarget = $(e.currentTarget),
        eventObj = { "event": data[1],
                       "eventCallback": function() {
                    	   if(!trackingDone){
                    		   invokeOtherHandlers($currenttarget,e);
                    		   trackingDone = true;
                    	   }
                     	   return false;
                        }
                      };
       if(data[2]){
        eventObj[data[2]] = data[3];
       }
      
  
      dataLayer.push(eventObj);
      //if no tracking happens in one seconds, continue with event other handlers 
      setTimeout(function(){
    	  if(!trackingDone){//to make sure 'invokeOtherHandlers' won't be invoked twice
	   		   invokeOtherHandlers($currenttarget,e);
	   		   trackingDone = true;
   	      }
    	  return false;
      }, 1000);
     
      e.preventDefault();
      e.stopPropagation();
    }
    
    function invokeOtherHandlers($elem, e){
    	  $elem.trigger(e.type);
    	  //http://stackoverflow.com/questions/20928915/jquery-triggerclick-not-working
    	  //It looks like the default click action (navigate) doesn�t work ,on trigger click will  triggers the event handler but doesn�t follow the link
    	 
    	  if($elem.attr('href') && $elem.attr('href').length > 0){
    		  window.location.href = $elem.attr('href');//This takes care of '<a>' click, form 'submit' won't be handled by this.
    	  }
    }
    
    function trackNonPageChangeEvent(data){
       var eventObj = { "event": data[1]};
       if(data[2]){
           eventObj[data[2]] = data[3];
       }

       dataLayer.push(eventObj);
      
    }
    
    _init();

});

var BOLT = BOLT || {};
(function (B) {
	/*Expected track Data object format
	 * Example- action
	 * {"event":<action>,
	 *   <data field>,<value>//optional
	 * }
	 * Exmaple: category data
	 *   "c": { 
            "c": { 
                "id": [Current Category Id] 
            }, 
            "l0": { 
                "id": [L0 Category Id] 
            }, 
            "l1": { 
                "id": [L1 Category Id] 
            }, 
            "l2": { 
                "id": [L2 Category Id] 
            }, 
            "l3": { 
                "id": [L3 Category Id] 
            }, 
            "l4": { 
                "id": [L4 Category Id] 
            } 
        } Other data objects for this page go here  
	 */
	B.trackEvents = function(trackData){

		  if(typeof dataLayer != "undefined"){
			  dataLayer.push(trackData);
		  }
	};
	
	B.trackEventsAsynch = function(trackData,callback){
		 var trackingDone = false;//to make sure callback won't be invoked twice
		if(typeof dataLayer != "undefined" ){
			  dataLayer.push(trackData);
			  dataLayer.push({"eventCallback": function() {
				  if(!trackingDone){
				    callback();
				    trackingDone = true;
				  }
			    }});
			  
		  }
		 setTimeout(function(){
			 if(!trackingDone){
			    callback();
			    trackingDone = true;
			  }
	     }, 1000);
	
	};
	
   
})(BOLT);





//We may delete this as we are going forward with GTM not GA. The above function is a modified version of this.
$(function(){

    /*
     *
     * Analytics mechanism monitors click events on any tag with data in its data-gaq attribute `data-gaq='PostAd|SelectAll|1|false'`
     * The string value MUST have four pipe delimited parameters, including:
     *  0-category(String),
     *  1-action(String),
     *  2-optValue(Integer: the value to give this interaction),
     *  3-optNonInteraction(Boolean: true if you don't want it to effect bounce rate)
     * Tolerates empty tags by filtering them via delegate.
     * No sanity checks on input
     *
     */

    var SUPPORTED_EVENTS = ["click"];
    var EVENT_NAMESPACE = ".AnalyticsGAQ";
    var GAQ_ELEMENT_SELECTOR = '[data-gaq]:not([data-gaq=""])';

    function _init(){

        // namespaced event selector "click.gaq change.gaq"
        var supported = $.map(SUPPORTED_EVENTS, function(v,i){
            return v + EVENT_NAMESPACE;
        }).join(" ");

        $('body')
            .off(supported)
            .on(supported,GAQ_ELEMENT_SELECTOR,analyticsTrackingEventHandler);

    }

    function analyticsTrackingEventHandler(e){

        var s = $(e.currentTarget).data("gaq") || "",
            label =  [
                    $('input[type=hidden][name=NlocId], input[type=hidden][name=locId], input[type=hidden][name=locationId]').val() || 0,
                    $('input[type=hidden][name=NcatId], input[type=hidden][name=catId], input[type=hidden][name=categoryId]').val() || 0
            ].join("_"),
            data = s.split("|");

        if(! data.length)
            return;

        data = [
            "siteTracker._trackEvent",
            data[0],
            data[1],
            label,
                data[2]-0,
                data[3].toLowerCase().substr(0,1) === 't'
        ];

        if(_gaq){
            _gaq.push(data);
            $(e.target).attr("data-gaq",""); // BOLT-10957
        }
    }

    _init();

});



