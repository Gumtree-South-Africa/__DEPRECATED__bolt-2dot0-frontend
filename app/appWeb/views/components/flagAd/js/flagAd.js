'use strict';

let submitForm = event => {
  event.preventDefault();
  
  let url = this.form.attr('action');

  let params = {
    "adId": this.form.find("[name='adId']").val(),
    "captchaToken": this.form.find("[name='captchaToken']").val(),
    "flagAdType": this.form.find(":checked").val(),
    "email": this.form.find("[name='email']").val(),
    "comments":this.form.find("[name='comments']").val()
  };

  $.post(url, params, response => {
    this.container.find('textarea, input:not(:disabled)').removeClass('error');
    if(response.success) {
      this.container.remove();
      this.adReported.removeClass('hide');
    } else {
      let errors = response.errors;
      errors.forEach(e => {
        let input = this.form.find(`[name='${e.field}']`);
        input.addClass('error');
        input.next().text(`${e.message}`);
      });
    }
  });
};

let initialize = () => {

  this.container = $('.flagad-container');
  this.adReported = $('.vip-flagad > .reported-ad');
  this.form = $('.flagad-container > form.flagAd.tallForm');
  
  let title = $('.unreported-ad > a.title');
  title.on('click', () => {
    this.container.hasClass('state-changed') ? this.container.removeClass('state-changed') : this.container.addClass('state-changed');
  });

  $('button.action-button.cancel').click(() => this.container.removeClass('state-changed'));

  this.form.on('submit', submitForm);
};

module.exports = {
  initialize
};
