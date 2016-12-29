'use strict';

let _preventDefault = (e) => {
	e.preventDefault();
};

let showFormModal = () => {
	document.addEventListener('touchmove', _preventDefault, false);
	$('#flagAdModal').removeClass('hiddenElt');
	$('body').addClass('stop-scrolling');
};

let hideFormModal = () => {
	document.addEventListener('touchmove', _preventDefault, false);
	$('#flagAdModal').addClass('hiddenElt');
	$('body').removeClass('stop-scrolling');
};

let hideFormTakeOver = () => {
	let $replyForm = this.$form;
	$('.header-wrapper').removeClass('fixed-header hidden-search');
	$replyForm.addClass('hide');
	$replyForm.removeClass('fixed');
	this.$headerTitle.text(this.headerTitleText);
};

let showFormTakeOver = () => {
	$('.header-wrapper').addClass('fixed-header hidden-search');
	this.$form.removeClass('hide');
	this.$form.addClass('fixed');
	this.$headerHeight = $('.header-wrapper').height();
	this.$form.css('top', this.$headerHeight + 'px');
	$('.header-back').addClass('hidden');
	$('.header-backed').removeClass('hidden');
	this.$headerTitle.text(this.reportLabel);
};

let submitForm = event => {
	event.preventDefault();

	let url = this.$form.attr('action');

	let params = {
		"adId": this.$form.find("[name='adId']").val(),
		"captchaToken": this.$form.find("[name='captchaToken']").val(),
		"flagAdType": this.$form.find(":checked").val(),
		"email": this.$form.find("[name='email']").val(),
		"comments":this.$form.find("[name='comments']").val()
	};

	$.post(url, params, response => {
		this.$container.find('textarea, input:not(:disabled)').removeClass('error');
		if(response.success) {
			hideFormTakeOver();
			hideFormModal();
			this.$container.remove();
			this.$adReported.removeClass('hide');
		} else {
			let errors = response.errors;
			errors.forEach(e => {
				let input = this.$form.find(`[name='${e.field}']`);
				input.addClass('error');
				input.next().text(`${e.message}`);
			});
		}
	});
};

let initialize = () => {
	console.log('neto');
	this.$container = $('.flagad-container');
	this.$adReported = $('.vip-flagad > .reported-ad');
	this.$form = $('.flagad-container form.flagAd.tallForm');

	let title = $('.unreported-ad > a.title');
	this.reportLabel = title.find('.label').text();
	this.$headerTitle = $('.post-ad-header .title-text');
	this.headerTitleText = $('.post-ad-header .title-text').text();

	title.on('click', () => {
		if(this.$form.hasClass('form-in-modal')) {
			showFormModal();
		} else {
			showFormTakeOver();
		}
	});

	$('button.action-button.cancel, .header-backed, #flagAdModal .close-button').click(() => {
		if(this.$form.hasClass('form-in-modal')) {
			hideFormModal();
		} else {
			hideFormTakeOver();
		}
	});

	this.$form.on('submit', submitForm);
};

module.exports = {
	initialize
};
