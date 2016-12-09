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
      adService         = require(cwd + '/server/services/adService');

router.post('/', (req, res) => {
  const SECRET_KEY = config.get('recaptcha.SECRET_KEY');
  
  let jsonPayload = isMyJsonValid(flagAdSchema, {greedy: true });
  let isPayloadValid = jsonPayload(req.body);
  
  let adId = req.body.adId;
  let captchaToken = req.body.captchaToken;
  
  let flagData = {
    "flagName": req.body.flagAdType,
    "email": req.body.email,
    "comments": req.body.comments
  };

  if(isPayloadValid) {
    let recaptchaData = querystring.stringify({
      secret: SECRET_KEY,
      response: captchaToken
    });

    let recaptchaConfig = config.get('recaptcha.server');
    recaptchaConfig['headers'] = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(recaptchaData)
    };

    // TODO: Send 400 HTTP Code when there is an error instead of the 200
    bapiCall.doPost(recaptchaData, recaptchaConfig, null)
    .then(resp => {
      if(resp.success) {
        let model = new RecaptchaModel(req, res);
        model.populateData().then(function(modelData) {
          adService.flagAd(modelData.bapiHeaders, adId, JSON.stringify(flagData))
            .then(() => {
              res.send({
                success: true
              });
            }).fail((err) => {
              console.error(err);
              console.error(err.stack);
              // Right now this is only for convenience
              // if we send a 4XX code then the JS request fails and we get the message as a string
              // we will need to parse and then show the errors
              res.send({
                success: false,
                errors: []
              });
          });   
        });
      } else {
        // TODO: Send 400 HTTP Code when there is an error instead of the 200
        res.send({
          success: false,
          errors: []
        });
      }
    })
    .fail(err => {
      console.error(err);
      // TODO: Send 400 HTTP Code when there is an error instead of the 200
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
