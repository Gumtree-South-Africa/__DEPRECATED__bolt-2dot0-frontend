'use strict';

let deviceDetection = require(process.cwd() + '/modules/device-detection');
const propName = 'topCategories';

class TopCategoriesModel {
  constructor(req, res) {
    this.req = req;
    this.res = res;
  }

  get enabled() {
    let bapiConfigData = this.res.locals.config.bapiConfigData;
    let device = deviceDetection.isMobile() ? 'mobile' : 'desktop';
    let array = bapiConfigData['bapi']['HomepageV2'][device];
    return array.models.indexOf(propName) >= 0;
  }

  get categories() {
    if(this.enabled) {
      return this.res.locals.config.bapiConfigData.topCategories;
    } else {
      return [];
    }
  }
}
module.exports = TopCategoriesModel;
