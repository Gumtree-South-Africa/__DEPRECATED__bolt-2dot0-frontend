
'use strict';

class AppDownloadModel {

	constructor(req, res) {
        this.req = req;
        this.res = res;
    }

    getAppDownload() {
    	let bapiConfigData = this.res.locals.config.bapiConfigData;
    	let reviews = bapiConfigData.content.homepageV2.reviews; //array
    	
    	let startingIndex = 0, numOfAdsToSend, totalNumOfAds, maxIndexForAds;
    	let deviceDetection = require(process.cwd() + '/modules/device-detection');
        
		if(deviceDetection.isMobile()) {
			numOfAdsToSend = 1;
		}
		else{
			numOfAdsToSend = 3;
		}
	
		totalNumOfAds = reviews.length;
		maxIndexForAds = totalNumOfAds -1;
		
		if (this.req.cookies['adStartingIndex']) {
			//read the startingIndex value from cookie and add by numOfAds to display
			startingIndex = parseInt (this.req.cookies['adStartingIndex']) + numOfAdsToSend;
		}
		
		if (startingIndex > maxIndexForAds)
		{
			startingIndex = (startingIndex % maxIndexForAds) - 1; //Index went over, so circling back to beginning.
		}
		
		this.res.cookie('adStartingIndex', startingIndex); // set the new value in the cookie
		
		// return three values only
		if ((startingIndex + numOfAdsToSend) <= totalNumOfAds )
		{
			reviews = reviews.slice(startingIndex, startingIndex + numOfAdsToSend);
		}
		else
		{
			reviews = reviews.slice(startingIndex, totalNumOfAds)
								.concat(reviews.slice(0, (numOfAdsToSend - (totalNumOfAds - startingIndex))));
		}
    	
    	return reviews;
    
    }
}

module.exports = AppDownloadModel;

