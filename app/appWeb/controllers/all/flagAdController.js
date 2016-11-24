'use strict';

const express           = require('express'),
      router            = express.Router(),
      isMyJsonValid     = require('is-my-json-valid'),
      _                 = require('underscore'),
      querystring       = require('querystring'),
      cwd               = process.cwd(),
      config            = require('config'),
      flagAdSchema      = require(cwd + '/app/appWeb/jsonSchemas/flagAdRequest-schema.json'),
      RecaptchaModel    = require(cwd +'/app/builders/common/RecaptchaModel.js'),
      bapiCall          = require(cwd +'/server/services/bapi/BAPICall'),
      adService     = require(cwd + '/server/services/adService');

// const SITE_KEY = '6LdPxgwUAAAAAPsz0LEG3ehKFWC6lJPkw1aNak0D';
const SECRET_KEY = '6LdPxgwUAAAAAHKBHEloU4L4t_Bho6_YFDG1rnFR';

router.post('/', (req, res) => {
  
  let jsonPayload = isMyJsonValid(flagAdSchema, {greedy: true });
  let isPayloadValid = jsonPayload(req.body);
  
  let adId = req.body.adId;
  let flagData = {
    "captchaToken": req.body.captchaToken,
    "flagAdType": req.body.flagAdType,
    "email": req.body.email,
    "comments": req.body.comments
  };

  if(isPayloadValid) {
    let postData = querystring.stringify({
      secret: SECRET_KEY,
      response: flagData.captchaToken
    });

    let recaptchaConfig = config.get('recaptcha.server');
    recaptchaConfig['headers'] = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData)
    };

    bapiCall.doPost(postData, recaptchaConfig, null)
    .then(resp => {
      if(resp.success) {
        let model = new RecaptchaModel(req, res);
        model.populateData().then(function(modelData) {
          adService.flagAd(modelData.bapiHeaders, adId, flagData)
            .then(function(dataReturned) {
              let response = dataReturned;
                console.log(response);
                res.send({
                  success: true
                });
            }).fail((err) => {
              console.error(err);
              console.error(err.stack);
              res.send({
                success: false,
                errors: []
              });
          });   
        });
      } else {
        res.send({
          success: false,
          errors: [
            {
              "field": "captchaToken",
              "message": "Captcha incorrecto"
            }
          ]
        });
      }
    })
    .fail(err => {
      console.error(err);
      res.send({
        success: false,
        errors: []
      });
    });
  } else {
    let uniqErrors = _.uniq(jsonPayload.errors.map(e => e.field.split('.')[1]));
    let errorMessages = req.i18n.locales[req.i18n.locale].vip.flag.errorMessages;
    let filteredErrors = errorMessages.filter(e => uniqErrors.indexOf(e.field) >= 0);
    res.send({
      success: false,
      errors: filteredErrors
    });
  }

  
});

module.exports = router;
