//
// AdReplyFileAttachment.js
// @author machung
//

var AdReplyFileAttachment = (function (){

	//
	// Private
	//
	var $filename, $filesizeHint;
	var $btnDummyChooseFile, $lnkRemoveFile;
	var $iconPaperclip, $iconSpinner;
	var $errorMessage, msgFileSizeExceeded;
	var $uploadContainer;
	var maxAttachmentSize = $("[data-attachment-size]").attr("data-attachment-size") || 1048576;

	function isAttachmentUnderOneMB(file) {
		if (window.File) {
			var fileSize =  file[0].size / maxAttachmentSize;
			if (fileSize > 1) return false;
		}
		return true;
	}

	function showUploadingMessage(filename) {

		$iconSpinner.show();

		$filesizeHint.hide();
		$errorMessage.hide();

		if(filename) {
			showFilename('"' + filename + '"');
		}

	}

	function clearAttachedFile() {
		$('#fileName, #rand').val("");
	}

	function showPaperclip() {
		$iconPaperclip.show();
		$iconSpinner.hide();
	}

	function hideIcons() {
		$iconSpinner.hide();
		$iconPaperclip.hide();
	}

	function showFilename(filename) {
		$filename.html(filename);
		$filename.show();
	}

	function hideFilename() {
		$filename.hide();
		$filename.html('');
	}

	function setAttachedFile(filename, randVal) {
		$('#fileName').val(filename);
		$('#rand').val(randVal);
	}

	function showErrorMessage(message) {
		$errorMessage.html(message);
		$errorMessage.show();
	}

	function initJQuerySelections() {
		$filename = $('#filenamelabel');
		$filesizeHint = $('.help');
		$btnDummyChooseFile = $('.dummy-datafile-button');
		$lnkRemoveFile = $('.remove');
		$errorMessage = $('#errorMessageSpan');
		$iconPaperclip = $('#paperclipspan');
		$iconSpinner = $('.spinner');
		msgFileSizeExceeded = $('#file-attach').data('msg-filesizeexceeded');
		$uploadContainer = $('#upload-container');
	}

	function init() {
		initJQuerySelections();

		$('#file-attach')
			.on('change', '#datafile', onFileAttachStart)
			.on('replyFormSubmit', function() {
				$('#datafile').remove();
			});

		$('.remove').click(AdReplyFileAttachment.onFileRemove);
	}

	function onFileAttachSuccess(data) {
		showPaperclip();
		showFilename(data.filename);

		setAttachedFile(data.filename, data.randVal);
		$lnkRemoveFile.show();
	}

	function onFileAttachFailure(data) {
		hideIcons();
		showFilename(data.filename);
		showErrorMessage(data.errorMessage);

		clearAttachedFile();
		restoreFileInput();
		$lnkRemoveFile.hide();
	}

	function resetForm() {
		hideIcons();
		hideFilename();
		clearAttachedFile();

		$errorMessage.hide();

		restoreFileInput();
		$lnkRemoveFile.hide();
		$filesizeHint.show();
	}

	function appendIFrameForUploadFormTarget() {
		var iframe = $('<iframe />', {
			name: 'uploadedFile',
			id:   'uploadedFile',
			style: 'position:absolute;left:-10000px',
			src: "about:blank"
		});

		iframe.appendTo('body');
	}

	function onFileAttachStart(e) {
		e.stopImmediatePropagation();

		if(canUseFileAPI()) {
			if (isAttachmentUnderOneMB(e.target.files)) {
				startUpload(e);
			}
			else{
				onFileAttachFailure({ filename: e.target.files[0].name, errorMessage: msgFileSizeExceeded });
			}
		}
		else {
			startUpload(e);
		}
	}

	function startUpload(e) {
		var filename = canUseFileAPI() ? e.target.files[0].name : '';

		showUploadingMessage(filename);
		submitAttachmentForm();

		$btnDummyChooseFile.hide();
	}


	function submitAttachmentForm() {
		var $fileAttachmentForm = $('#fileAttachmentForm');

		appendIFrameForUploadFormTarget();

		$fileAttachmentForm.find('input[type=file]').remove();
		$fileAttachmentForm.append($('#upload-container #datafile'));
		$fileAttachmentForm.submit();
	}

	function canUseFileAPI() {
		return $("<input type='file'>").get(0).files !== undefined;
	}

	function restoreFileInput() {
		$btnDummyChooseFile.show();
		$uploadContainer.find('input[type=file]').remove();
		$("<input type='file' name='datafile' id='datafile'/>").appendTo($uploadContainer);
	}

	//
	// Public
	//
	return {
		init: init,

		onFileAttachStart: onFileAttachStart,

		onFileRemove: function (e) {
			resetForm();
			e.preventDefault();
		},

		onFileAttachSuccess: function (e, data) {
			setTimeout(function() { onFileAttachSuccess(data) }, 2000);
		},

		onFileAttachFailure: function (e, data) {
			onFileAttachFailure(data);
		},

		resetForm: resetForm
	};

})();

$(document).ready(function () {
	AdReplyFileAttachment.init();
	$('.replyAd').on('fileAttachSuccess', AdReplyFileAttachment.onFileAttachSuccess)
				 .on('fileAttachFailure', AdReplyFileAttachment.onFileAttachFailure);
});
