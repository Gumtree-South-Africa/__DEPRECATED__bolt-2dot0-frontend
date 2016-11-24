'use strict';


const cwd               = process.cwd(),
      ModelBuilder      = require(cwd + '/app/builders/common/ModelBuilder'),
      // AbstractPageModel = require(cwd + '/app/builders/common/AbstractPageModel'),
      Q                 = require('q');

class RecaptchatModel {
  constructor(req, res) {
    this.req = req;
    this.res = res;
    this.dataPromiseFunctionMap = {};
  }

  populateData() {
    // let abstractPageModel = new AbstractPageModel(this.req, this.res);
    let modelBuilder = new ModelBuilder();
    let modelData = modelBuilder.initModelData(this.res.locals, this.req.app.locals, this.req.cookies);
    return Q(modelData);
  }
}

module.exports = RecaptchatModel;
