
'use strict';

class AppDownloadModel {

	constructor(req, res) {
        this.req = req;
        this.res = res;
    }

    getAppDownload() {
    	let bapiConfigData = this.res.locals.config.bapiConfigData;
    	let reviews = bapiConfigData.content.homepageV2.reviews;
       return reviews;
    } 
}

module.exports = AppDownloadModel;

