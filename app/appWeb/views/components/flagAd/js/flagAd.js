'use strict';

let submitForm = event => {
  event.preventDefault();

  let form = $('.flagad-container > form.flagAd.tallForm');
  let url = form.attr('action');

  let params = {
    "adId": form.find("[name='adId']").val(),
    "captchaToken": form.find("[name='captchaToken']").val(),
    "flagAdType": form.find(":checked").val(),
    "email": form.find("[name='email']").val(),
    "comments":form.find("[name='comments']").val()
  };

  $.post(url, params, response => {
    let container = $('.flagad-container');
    container.find('textarea, input:not(:disabled)').removeClass('error');
    if(response.success) {
      container.removeClass('state-changed');
    } else {
      let errors = response.errors;
      errors.forEach(e => {
        let input = form.find(`[name='${e.field}']`);
        input.addClass('error');
        input.next().text(`${e.message}`);
      });
    }
  });
};

let initialize = () => {

  let container = $('.flagad-container');
  let form = $('.flagad-container > form.flagAd.tallForm');
  let title = $('.unreported-ad > a.title');

  title.on('click', () => {
    container.hasClass('state-changed') ? container.removeClass('state-changed') : container.addClass('state-changed');
  });

  $('button.action-button.cancel').click(() => {
    container.removeClass('state-changed');
    // container.find('textarea, input:not(:disabled)').removeClass('error').val('');
  });

  form.on('submit', submitForm);
};

module.exports = {
  initialize
};
