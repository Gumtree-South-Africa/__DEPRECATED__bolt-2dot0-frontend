'use strict';

// $(document).ready(function () {
var BOLT = BOLT || {};
var PREFIX_DIR  = '/public/images';

(function (B) {
  // Prevent jshint warning error
  //if (typeof webkitSpeechRecognition === 'undefined') {
    var webkitSpeechRecognition = function () {};
  //}

  // Private vars/objects
  var langs =
  [['Afrikaans',       ['af-ZA']],
   ['Bahasa Indonesia',['id-ID']],
   ['Bahasa Melayu',   ['ms-MY']],
   ['Català',          ['ca-ES']],
   ['Čeština',         ['cs-CZ']],
   ['Deutsch',         ['de-DE']],
   ['English',         ['en-AU', 'Australia'],
                       ['en-CA', 'Canada'],
                       ['en-IN', 'India'],
                       ['en-NZ', 'New Zealand'],
                       ['en-ZA', 'South Africa'],
                       ['en-GB', 'United Kingdom'],
                       ['en-US', 'United States']],
   ['Español',         ['es-AR', 'Argentina'],
                       ['es-BO', 'Bolivia'],
                       ['es-CL', 'Chile'],
                       ['es-CO', 'Colombia'],
                       ['es-CR', 'Costa Rica'],
                       ['es-EC', 'Ecuador'],
                       ['es-SV', 'El Salvador'],
                       ['es-ES', 'España'],
                       ['es-US', 'Estados Unidos'],
                       ['es-GT', 'Guatemala'],
                       ['es-HN', 'Honduras'],
                       ['es-MX', 'México'],
                       ['es-NI', 'Nicaragua'],
                       ['es-PA', 'Panamá'],
                       ['es-PY', 'Paraguay'],
                       ['es-PE', 'Perú'],
                       ['es-PR', 'Puerto Rico'],
                       ['es-DO', 'República Dominicana'],
                       ['es-UY', 'Uruguay'],
                       ['es-VE', 'Venezuela']],
   ['Euskara',         ['eu-ES']],
   ['Français',        ['fr-FR']],
   ['Galego',          ['gl-ES']],
   ['Hrvatski',        ['hr_HR']],
   ['IsiZulu',         ['zu-ZA']],
   ['Íslenska',        ['is-IS']],
   ['Italiano',        ['it-IT', 'Italia'],
                       ['it-CH', 'Svizzera']],
   ['Magyar',          ['hu-HU']],
   ['Nederlands',      ['nl-NL']],
   ['Norsk bokmål',    ['nb-NO']],
   ['Polski',          ['pl-PL']],
   ['Português',       ['pt-BR', 'Brasil'],
                       ['pt-PT', 'Portugal']],
   ['Română',          ['ro-RO']],
   ['Slovenčina',      ['sk-SK']],
   ['Suomi',           ['fi-FI']],
   ['Svenska',         ['sv-SE']],
   ['Türkçe',          ['tr-TR']],
   ['български',       ['bg-BG']],
   ['Pусский',         ['ru-RU']],
   ['Српски',          ['sr-RS']],
   ['한국어',            ['ko-KR']],
   ['中文',             ['cmn-Hans-CN', '普通话 (中国大陆)'],
                       ['cmn-Hans-HK', '普通话 (香港)'],
                       ['cmn-Hant-TW', '中文 (台灣)'],
                       ['yue-Hant-HK', '粵語 (香港)']],
   ['日本語',           ['ja-JP']],
   ['Lingua latīna',   ['la']]];


  function linebreak(s) {
    return s.replace(/\n\n/g, '<p></p>').replace( /\n/g, '<br>');
  }

  function capitalize(s) {
    return s.replace(/\S/, function(m) { return m.toUpperCase(); });
  }

  // Constructor
  B.SpeechRecognition = function (config, micCallbackFn, redirectDisabled) {
    // Check for redirect.
    this.redirectEnabled = true;
    if (redirectDisabled) {
      this.redirectEnabled = false;
    }

    if (!config) {
      throw 'Need a configuration object!';
    }

    this.micCallbackFn = micCallbackFn;

    this.init(config);
  };

  // Public methods and objects
  B.SpeechRecognition.prototype = {

    init : function (config) {
      var i, key;

      this.config = config;

      // Hold the DOM references
      this.node = {};

      // Instance-specific object references
      this.current_style  = null;

      this.create_email = false;

      this.final_transcript = '';

      this.recognizing = false;

      this.ignore_onend = false;

      this.start_timestamp = null;

      this.recognition = null;

      // Have references to all the DOM elements
      for (key in config) {
        this.node[key] = document.getElementById(config[key]);
      }

      if (this.node.select_language) {
        for (i = 0; i < langs.length; i++) {
          this.node.select_language.options[i] = new Option(langs[i][0], i);
        }

        this.node.select_language.selectedIndex = 6;
        this.updateCountry();
        this.node.select_dialect.selectedIndex = 6;
      }

      this.syncUI();

      this.showInfo('info_start');

      if (!('webkitSpeechRecognition' in window)) {
        this.upgrade();
      } else {
        this.node.start_button.style.display = 'inline-block';
        this.setRecognitionProcess();
      }
    },

    syncUI : function () {
      var self = this;
      if (this.node.start_button) {
        this.node.start_button.onclick = function (e) {

          if (self.micCallbackFn && self.config.start_img) {
            if ($('#' + self.config.start_img).data('fullview')) {
              self.startButton(e);
            } else {
              self.micCallbackFn();
            }
          } else {
            self.startButton(e);
          }

        };
      }
      if (this.node.copy_button) {
        this.node.copy_button.onclick = function(e) { self.copyButton(e); };
      }
      if (this.node.email_button) {
        this.node.email_button.onclick = function (e) { self.emailButton(e); };
      }
      if (this.node.select_language) {
        this.node.select_language.onchange = function (e) { self.updateCountry(e); };
      }
    },

    updateCountry : function() {
      var i, list;
      for (i = this.node.select_dialect.options.length - 1; i >= 0; i--) {
        this.node.select_dialect.remove(i);
      }
      list = langs[this.node.select_language.selectedIndex];
      for (i = 1; i < list.length; i++) {
        this.node.select_dialect.options.add(new Option(list[i][1], list[i][0]));
      }
      this.node.select_dialect.style.visibility = list[1].length === 1 ? 'hidden' : 'visible';
    },


    resetFinalScript : function () {
      this.final_transcript = '';
      this.node.final_span.innerHTML = '';
      this.node.interim_span.innerHTML = '';
    },

    setRecognitionProcess : function() {
      var self = this;
      var processedRecognition = false;
      var recognition = new webkitSpeechRecognition();
      this.recognition = recognition;

      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = function() {
        self.recognizing = true;
        self.showInfo('info_speak_now');
        self.node.start_img.src =  PREFIX_DIR + '/mic-animate.gif';
      };

      recognition.onerror = function(event) {
        if (event.error === 'no-speech') {
          self.node.start_img.src = PREFIX_DIR + '/mic.png';
          self.showInfo('info_no_speech');
          self.ignore_onend = true;
        }
        if (event.error === 'audio-capture') {
          self.node.start_img.src = PREFIX_DIR + '/mic.png';
          self.showInfo('info_no_microphone');
          self.ignore_onend = true;
        }
        if (event.error === 'not-allowed') {
          if (event.timeStamp - self.start_timestamp < 100) {
            self.showInfo('info_blocked');
          } else {
            self.showInfo('info_denied');
          }
          self.ignore_onend = true;
        }
      };

      recognition.onend = function() {
        self.recognizing = false;
        if (self.ignore_onend) {
          return;
        }
        self.node.start_img.src = PREFIX_DIR + '/mic.png';
        if (!self.final_transcript) {
          self.showInfo('info_start');
          return;
        }
        self.showInfo('');
        if (window.getSelection) {
          window.getSelection().removeAllRanges();
          var range = document.createRange();
          //range.selectNode(document.getElementById('final_span'));
          range.selectNode(self.node.final_span);
          window.getSelection().addRange(range);
        }
        if (self.create_email) {
          self.create_email = false;
          self.createEmail();
        }
      };

      recognition.onresult = function(event) {
        var interim_transcript = '', i, term;
        if (processedRecognition) {
          return true;
        }
        for (i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            self.final_transcript += event.results[i][0].transcript;
          } else {
            interim_transcript += event.results[i][0].transcript;
          }
        }

        $(self.node.final_span).parent().find('.placeholder').html('');

        self.final_transcript = capitalize(self.final_transcript);
        self.node.final_span.innerHTML = linebreak(self.final_transcript);
        self.node.interim_span.innerHTML = linebreak(interim_transcript);
        if (self.final_transcript || interim_transcript) {
          self.showButtons('inline-block');
          if (self.final_transcript && self.redirectEnabled) {
            term = self.final_transcript.toLowerCase();
            window.location = '/search/query?term=' + term;
            processedRecognition = true;
          }
        }
      };
    },

    upgrade : function() {
      // this.start_button.style.visibility = 'hidden';
      this.start_button.style.display = 'none';
      this.showInfo('info_upgrade');
    },

    createEmail : function() {
      var subject, body;

      var n = this.final_transcript.indexOf('\n');
      if (n < 0 || n >= 80) {
        n = 40 + this.final_transcript.substring(40).indexOf(' ');
      }

      subject = encodeURI(this.final_transcript.substring(0, n));
      body = encodeURI(this.final_transcript.substring(n + 1));
      window.location.href = 'mailto:?subject=' + subject + '&body=' + body;
    },

    copyButton : function() {
      if (this.recognizing) {
        this.recognizing = false;
        this.recognition.stop();
      }
      this.node.copy_button.style.display = 'none';
      this.node.copy_info.style.display = 'inline-block';
      this.showInfo('');
    },

    emailButton : function() {
      if (this.recognizing) {
        this.create_email = true;
        this.recognizing = false;
        this.recognition.stop();
      } else {
        this.createEmail();
      }
      this.node.email_button.style.display = 'none';
      this.node.email_info.style.display = 'inline-block';
      this.showInfo('');
    },

    startButton : function(event) {
      if (this.recognizing) {
        this.recognition.stop();
        return false;
      }

      this.final_transcript = '';
      if (this.node.select_dialect) {
        this.recognition.lang = this.node.select_dialect.value;
      }
      this.recognition.start();
      this.ignore_onend = false;

      this.node.final_span.innerHTML = '';
      this.node.interim_span.innerHTML = '';
      this.node.start_img.src = PREFIX_DIR + '/mic-slash.gif';
     
      this.showInfo('info_allow');
      this.showButtons('none');
      this.start_timestamp = event.timeStamp;

      return false;
    },

    showInfo : function(s) {
      var child;
      if (s) {
        for (child = this.node.info.firstChild; child; child = child.nextSibling) {
          if (child.style) {
            child.style.display = (child.id === s) ? 'inline' : 'none';
          }
        }

        // this.node.info.style.visibility = 'visible';
        this.node.info.style.display = 'block';
      } else {
        // this.node.info.style.visibility = 'hidden';
        this.node.info.style.display = 'none';
      }
    },

    showButtons :  function(style) {
      return;
      // Uncomment the lines below to show the buttons.
      /*
      if (style == this.current_style) {
        return;
      }
      this.current_style = style;
      if (this.node.copy_button) {
        this.node.copy_button.style.display = style;
      }
      if (this.node.email_button) {
        this.node.email_button.style.display = style;
      }
      if (this.node.copy_info) {
        this.node.copy_info.style.display = 'none';
      }
      if (this.node.email_info) {
        this.node.email_info.style.display = 'none';
      }
      */
    }

  }; // End of SpeechRecognition.prototype

})(BOLT);


