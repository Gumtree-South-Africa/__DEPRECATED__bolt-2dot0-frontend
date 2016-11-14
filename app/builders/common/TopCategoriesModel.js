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
    console.log(array);
    return propName in array;
  }
}
module.exports = TopCategoriesModel;
