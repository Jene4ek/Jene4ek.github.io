// Include golden-number from NPM as window.goldenNumber
(function(){var n=(Math.sqrt(5)+1)/2;window.goldenNumber=function(t){var r=null==t?Math.random():t;return function(){return r=(r+n)%1}}})();

function InfoBlockSlider(slides) {
  this._sliderDom = null;
  this._swiper = null;

  // create dom and populate with slides
  this._createDomStructure(slides);

  // these are left to the user
  // - mount to where needed
  // - initialize
}

$.extend(InfoBlockSlider.prototype, {
  /**
   * Creates and populates DOM structure expected by the Swiper
   * @param {jQuery} items
   * @private
   */
  _createDomStructure: function(items) {
    this._sliderDom = $(
      '<div class="b-mobile-slider">\
        <div class="swiper-container">\
          <div class="swiper-wrapper">' +
            // <div class="swiper-slide"></div>\
          '</div>\
          <div class="swiper-pagination" />\
          <div class="swiper-button-next swiper-button-white" />\
          <div class="swiper-button-prev swiper-button-white" />\
        </div>\
      </div>'
    );

    this._sliderDom.find('.swiper-button-next, .swiper-button-prev').remove();

    var itemsContainer = this._sliderDom.find('.swiper-wrapper').empty();

    $(items).each(function() {
      var itemStructure = $(
        '<div class="swiper-slide">\
          <div class="b-mobile-slider__item"></div>\
        </div>'
      );

      itemStructure
        .children()
        .append($(this).clone());

      itemStructure
        .appendTo(itemsContainer);
    });
  },

  getDomNode: function() {
    return this._sliderDom;
  },

  initialize: function(useCoverflow) {
    if (this._swiper) {
      console.warn('Attempting to initialize Swiper multiple times.');
      return;
    }

    if (!this._sliderDom || !this._sliderDom.parent().length) {
      throw new Error('Slider DOM not initialized or detached from DOM tree');
    }

    var config = $.extend({
      direction: 'horizontal',
      autoHeight: true,
      grabCursor: true,
      centeredSlides: true,

      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      pagination: {
        el: '.swiper-pagination',
        type: 'bullets',
        clickable: true,
      },

      // should not enable, looks terrible
      loop: false,
    }, !useCoverflow ? {
      slidesPerView: 1,
      spaceBetween: 20,
    } : {
      effect: 'coverflow',
      slidesPerView: 1.25, // for coverflow means how many items should fit in available width, can be floating point

      // Implementation details here:
      // https://github.com/nolimits4web/swiper/blob/77d72e411ef91b7580eb8fb96f05f0e43a0a6b90/src/components/effect-coverflow/effect-coverflow.js
      // older version did not support percentage values for 'stretch', 'scale' was also introduced
      // in one of the recent versions, 3.1 only had 'modifier'
      coverflowEffect: {
        rotate: 0,
        stretch: '68%',
        depth: 350,
        scale: 0.8,
        // modifier: 1.3,
        slideShadows: false
      },
    });

    this._sliderDom
      .show()
      .toggleClass('coverflow', useCoverflow);

    this._swiper = new Swiper(
      this._sliderDom.find('.swiper-container').get(0),
      config,
    );
  },

  /**
   * Deinitializes slider but does not destroy the DOM, so it can be reinitialized again if needed.
   */
  deinitialize: function() {
    if (this._swiper == null) {
      return;
    }

    this._swiper.destroy();
    this._swiper = null;

    if (this._sliderDom) {
      this._sliderDom.hide();
    }
  },

  destroy: function() {
    this.deinitialize();

    if (this._sliderDom) {
      this._sliderDom.remove();
      this._sliderDom = null;
    }
  }
});

(function() {
  var siteParams = window.AD_SITE_PARAMS || {};

  function debounce(func, wait, immediate) {
    var timeout;

    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  }

  function trackEvent(eventName) {
    if (siteParams.env === 'development') {
      console.log('%cTracking event ' + eventName, 'color: skyblue');
    }

    // Yandex.Metrika
    try {
      if (siteParams && siteParams.yaMetrikaID) {
        ym(siteParams.yaMetrikaID, 'reachGoal', eventName)
      }
    } catch (e) {}

    // Google Analytics
    try {
      gtag('event', eventName);
    } catch (e) {}
  }

  function lockScroll() {
    var $body = $('body');
    var currentScrollTop = $('html').scrollTop();

    $body
      .addClass('scroll-locked')
      .scrollTop(currentScrollTop);
  }

  function unlockScroll() {
    var $body = $('body');
    var currentScrollTop = $body.scrollTop();

    $body.removeClass('scroll-locked');
    $('html').scrollTop(currentScrollTop);
  }

  function parseContactsString(contacts) {
    var phoneNumberRegex = /(\+?[78][\s-()0-9]+[0-9])/g;
    var emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

    var possiblePhoneNumber = (contacts.match(phoneNumberRegex) || [])
      .map(function (str) { return str.replace(/[^\d]/g, ''); })
      .find(function (str) { return str.length === 11; });

    var possibleEmail = (contacts.match(emailRegex) || [])[0];

    return {
      phoneNumber: possiblePhoneNumber || null,
      email: possibleEmail || null,
    };
  }

  /**
   *
   * @param {HTMLElement|jQuery} formNode - form element
   * @param {string} url
   * @param {function} onSuccess - callback
   * @param {HTMLElement|jQuery} successClsToggleNode - HTML element or jQuery node to toggle "success" class on
   * @param {string} [successClass] - class name to toggle on successClsToggleNode after submit
   */
  function initializeAjaxForm(formNode, url, onSuccess, successClsToggleNode, successClass) {
    var $form = $(formNode);
    var $formInputs = $form.find('input:not([type="submit"]), textarea');
    var isSending = false;

    // доп. проверка на свойство isTrusted при событии submit на формах
    $form.submit(function(e) {
      if (!e.originalEvent.isTrusted) {
        $form.find("input[type=text], textarea").val("");
      }
    });

    successClass = successClass || 'success';

    function lockControls() {
      isSending = true;
      $formInputs.prop('readOnly', true);
    }

    function unlockControls() {
      isSending = false;
      $formInputs.prop('readOnly', false);
    }

    let lastFormData = [];

    $form.ajaxForm({
      type: 'post',
      dataType: 'json',
      data: { utmMarks: getUtmMarks() },
      url: url,
      beforeSubmit: function(formData) {
        // на формы добавлены 2 неотображаемых поля с name: name и email
        var exceptions = ['name', 'email'];
        // если хотя бы одно из них заполнено - не отправляем данные на сервер
        var foundTrap = formData.find(function(item) {
          return (exceptions.includes(item.name) && item.value);
        });

        // дополнительная проверка по userAgent
        // если userAgent пустой(хотя, скорее всего у бота будет это свойство), то скорее всего это спам
        var userAgent = window.navigator.userAgent;

        if(foundTrap || !userAgent) {
          return false;
        }

        if (isSending) {
          return false;
        }

        var nonEmptyFields = $formInputs.filter(function() {
          return !!$(this).val()
        });

        if (!nonEmptyFields.length) {
          // console.log('Attempting to submit an empty form, ignoring');
          return false;
        }

        lastFormData = formData.filter(function(item) {
          return !exceptions.includes(item.name);
        });

        lockControls();
      },
      error: function(response) {
        unlockControls();

        if (response && response.responseJSON) {
          // console.error(response.responseJSON);
          alert('Сервер вернул ошибку: ' + response.responseJSON.message)
        } else {
          // дефолтное сообщение если нет интернета или сервер не отвечает
          alert('Не удалось отправить форму.\nПожалуйста повторите попытку позже.');
        }
      },
      success: function(response) {
        if (!response || response.code !== 200) {
          unlockControls();
          alert('Неожиданный ответ от сервера');
          return;
        }

        if (successClsToggleNode && successClass) {
          $(successClsToggleNode).addClass(successClass);

          setTimeout(function() {
            unlockControls();
            $form.get(0).reset();
            $(successClsToggleNode).removeClass(successClass);
          }, 5000);
        }

        $.isFunction(onSuccess) && onSuccess(lastFormData);

        lastFormData = [];
      }
    })
  }

  function getCurrentPageName(defaultValue = null) {
    var nav = siteParams.nav || {};
    var normalizedPath = window.location.pathname;
    var langPrefix = '/' + siteParams.currentLocale + '/';

    // Remove language code from the beginning
    normalizedPath = normalizedPath.indexOf(langPrefix) === 0
      ? normalizedPath.slice(langPrefix.length - 1)
      : normalizedPath;

    // also remove /index.html at the end if present,
    // with this we can support folder-based page urls
    normalizedPath = normalizedPath.replace(/\/index.html$/, '/');

    if (normalizedPath === '' || normalizedPath === '/') {
      return 'index';
    }

    for (var key in nav) {
      if (nav.hasOwnProperty(key) && nav[key] === normalizedPath) {
        return key;
      }
    }

    return defaultValue;
  }

  function getUtmMarks() {
    return document.location.search.split('&').filter(entry => entry.startsWith('utm_')).join('\n');
  }

  var initializers = {
    initLanguageSwitcher() {
      $('[data-js-language-switcher]').each(function() {
        $(this).find('ul li a').each(function() {
          var currentPath = location.pathname + location.search + (location.hash !== '#' ? location.hash : '');
          var lang = $(this).data('language');

          // return false;
          this.href = currentPath.replace(/\/[a-z]{2}(\/.*)/i, '/' + lang + '$1');
        }).click(function() {
          try {
            localStorage.setItem('language', $(this).data('language'));
          } catch (e) {}
        });
      });
    },

    initBackgroundAnimations: function() {
      var bgContainer = '.b-flying-boxes-background-container';

      // ensure correct structure
      $(bgContainer).each(function() {
        var $this = $(this);
        var $inner = $this.children(bgContainer + '__inner');
        var $bgLayer = $this.children(bgContainer + '__background-layer');

        // wrap every child element in an __inner if not done
        if (!$this.children(bgContainer + '__inner').length) {
          if ($bgLayer.length) {
            $bgLayer.detach();
          }

          var originalContents = $this.contents();

          $inner = $('<div class="' + bgContainer + '__inner" />');
          $inner.prependTo($this);
          $inner.append(originalContents);
        }

        // Make sure bgLayer is present
        $bgLayer = $bgLayer.length
          ? $bgLayer
          : $('<div class="' + bgContainer + '__background-layer" />');

        $bgLayer.prependTo($this);

        // if bgLayer is empty - that's not right. We should populate
        if (!$bgLayer.children('.b-flying-boxes-background').length) {
          $bgLayer.append('<div class="b-flying-boxes-background" />');
        }
      });

      // now initialize background effects if necessary
      $('.b-flying-boxes-background').each(function() {
        var $this = $(this);
        var itemsCount = $(this).children('.box').length
          || parseInt($(this).attr('data-blocks'), 10)
          || 17;

        $this.empty();

        var zoomRNG = window.goldenNumber();
        var leftRNG = window.goldenNumber();

        // populate boxes and randomize their positions
        for (var i = 0;i < itemsCount; i++) {
          $('<div class="box" />')
            .css({
              top: Math.random() * 100 + '%',
              left: (Math.random() + leftRNG()) * 50 + '%',
              zoom: 0.65 + zoomRNG() * 0.5,
            })
            .appendTo($this);
        }
      });
    },

    initIntegrationsSlider: function(elementsCollection) {
      if (!elementsCollection || !elementsCollection.length) {
        return;
      }

      var sliderBody = elementsCollection.find('.slider-body');
      var prevButton = elementsCollection.find('.slider-btn.prev');
      var nextButton = elementsCollection.find('.slider-btn.next');

      // Configuration options can be found here
      // Touch support is not enabled, requires additional dependency
      // http://caroufredsel.falsecode.ru/advanced.html
      sliderBody.carouFredSel({
        // auto: false,
        // circular: false,
        // infinite: false,
        prev: prevButton,
        next: nextButton,
        width: '100%',
        align: 'center',
        responsive: true, // means items will be resized to match the "items" count
        items: {
          visible: { min: 2, max: 4},
        },
        scroll: {
          // items: 'odd',
          pauseOnHover: false,
        },
        swipe: true,
        auto: {
          timeoutDuration: 5000,
        }
      });
    },

    initiContactsPopup: function() {
      var $body = $('body');
      var $popupNode = $('\
        <div class="b-contact-us-popup">\
          <div class="b-contact-us-popup__underlay"></div>\
          <div class="b-contact-us-popup__body"></div>\
        </div>\
      ');

      var $popupBody = $popupNode.children('.b-contact-us-popup__body');

      $('.b-contact-us-form')
        .clone()
        .addClass('b-contact-us-form--standalone')
        .data('in-modal', true)
        .appendTo($popupBody);

      $popupNode
        .prependTo($body)
        .hide();

      var HASH_NAME = '#sign-up-popup';
      var currentTransition = 'out'; // in for showing or show, out for hiding or hidden.

      function showModal() {
        if (currentTransition === 'in') return;
        currentTransition = 'in';

        window.location.hash = HASH_NAME;
        lockScroll();

        $popupNode
          .stop(true)
          .show()
          .css('opacity', 0)
          .fadeTo(500, 1);

        $popupNode.find('form').get(0).reset();
        focusLock.on($popupBody.get(0));
      }

      function hideModal() {
        if (currentTransition === 'out') return;
        currentTransition = 'out';

        focusLock.off($popupBody.get(0));

        window.location.hash = '#';
        unlockScroll();

        $popupNode
          .stop(true)
          .fadeOut(500);
      }

      $body.on('click', 'a[href="#sign-up-form"]', function() {
        showModal();
        return false;
      });

      $popupNode.click(function(e) {
        if ($popupNode.is(e.target)) {
          hideModal();
          return false;
        }
      });

      $(window).on('hashchange', function() {
        if (window.location.hash === HASH_NAME) {
          showModal();
        } else {
          hideModal();
        }
      });

      $popupBody.on('analytics.ajaxform-submit', function() {
        setTimeout(hideModal, 3500);
      });
    },

    initContactForm: function() {
      $('.b-contact-us-form').each(function() {
        var $block = $(this);
        var $form = $block.find('form');
        var eventFormTypeIdentifier = $block.data('in-modal') ? 'signup-modal' : 'signup';

        initializeAjaxForm(
          $form,
          siteParams.backend + 'signup',
          function(formData) {
            $form.trigger('analytics.ajaxform-submit', eventFormTypeIdentifier);

            try {
              var data = formData.reduce(function(accumulator, item) {
                accumulator[item.name] = item.value;
                return accumulator;
              }, {});

              var parsedContacts = parseContactsString(data.contacts);
              var calltouchParams = window.ct('calltracking_params')[0];

              jQuery.ajax({
                url: siteParams.calltouchAPI + 'calls-service/RestAPI/requests/' + calltouchParams.siteId + '/register/',
                dataType: 'json',
                type: 'POST',
                data: {
                  fio: data.website || data.contacts,
                  phoneNumber: parsedContacts.phoneNumber || '',
                  email: parsedContacts.email || '',
                  subject: 'Заявка на подключение',
                  custom: {
                    // looks like custom fields are not accepted by this method
                    website: data.website
                  },
                  comment: [
                    'Вебсайт: ' + (data.website || '(не указано)'),
                    'Контакты: ' + (data.contacts || '(не указано)'),
                    '',
                    'Сообщение:',
                    data.message,
                  ].join(' \r\n'),
                  tags: getCurrentPageName(''),
                  sessionId: calltouchParams.sessionId
                },
              });
            } catch (e) {
              // ignore error silently
            }
          },
          $block,
          'success'
        );

        var textareas = $form.find('textarea');

        // make textarea nicer

        textareas.css({
          overflow: 'hidden',
          resize: 'none'
        });

        autosize(textareas);

        $block.find('input, textarea, select').on('focus', function() {
          $(window).trigger('contactUsFormActivity');
        });

        $block.on('input paste', function() {
          $(window).trigger('contactUsFormActivity');
        });
      });
    },

    initConsultationForm: function() {
      $('.b-free-consultation-block').each(function() {
        var $block = $(this);
        var $form = $block.find('form');

        initializeAjaxForm(
          $form,
          siteParams.backend + 'consulting',
          function(formData) {
            $form.trigger('analytics.ajaxform-submit', 'consulting');

            try {
              var data = formData.reduce(function(accumulator, item) {
                accumulator[item.name] = item.value;
                return accumulator;
              }, {});

              var parsedContacts = parseContactsString(data.contacts);
              var calltouchParams = window.ct('calltracking_params')[0];

              jQuery.ajax({
                url: siteParams.calltouchAPI + 'calls-service/RestAPI/requests/' + calltouchParams.siteId + '/register/',
                dataType: 'json',
                type: 'POST',
                data: {
                  fio: data.contacts,
                  phoneNumber: parsedContacts.phoneNumber || '',
                  email: parsedContacts.email || '',
                  subject: 'Заявка на консультацию',
                  comment: 'Контакты: ' + data.contacts,
                  tags: getCurrentPageName(''),
                  sessionId: calltouchParams.sessionId
                },
              });
            } catch(e) {
              // ignore error silently
            }
          },
          $block,
          'success',
        );
      });
    },

    initAnalytics: function() {
      var signupModalEvent = null;

      // Regular events

      $('[data-js-signup-button]').on('click', function() {
        trackEvent('click-podluchit');
        signupModalEvent = 'otpravit-podluchit';
      });

      $('[data-js-portal-button]').on('click', function() {
        trackEvent('Kabinet-click');
      });

      $('[data-js-tariffs-button]').on('click', function() {
        trackEvent('zapros-cenu');
        signupModalEvent = 'zapros-cenu-otpravit';
      });

      $('[data-js-footer-email-link]').on('click', function() {
        trackEvent('email-click');
      });

      // Cобытия отправки форм обратной связи

      var analyticsPageAliases = {
        acquiring: 'ecvaer',
        p2p: 'p2p',
        qiwi: 'qiwi',
        index: 'glavnaya',
      };

      var pageSuffix = analyticsPageAliases[getCurrentPageName() || 'index'];

      $(window).on('analytics.ajaxform-submit', function (e, formName) {
        if (!formName || typeof formName !== 'string') {
          return;
        }

        // this should never occur during normal operation but just in case
        if (formName === 'signup-modal' && !signupModalEvent) {
          formName = 'signup';
        }

        switch (formName) {
          case 'signup-modal':
            trackEvent(signupModalEvent);
            signupModalEvent = null;
            break;
          case 'signup':
            trackEvent('zayavka-otpravit-' + pageSuffix);
            break;
          case 'consulting':
            trackEvent('konsultacia-' + pageSuffix);
            break;
          default:
            console.warn('analytics.ajaxform-submit event: unknown form name ' + formName);
        }
      });
    },

    initMobileNav: function() {
      var className = 'b-mobile-nav';
      var $body = $(document.body);
      var $hamburgerButton = $('[data-js-mobile-nav-header-button]');
      var $mobileNav = $('.' + className);
      var $mobileNavInner = $('.' + className).children();

      var isOpen = false;

      function toggle(state) {
        var newState = state == null ? !isOpen : !!state;

        if (newState === isOpen) return;

        isOpen = newState;

        if (newState) {
          lockScroll()
        } else {
          unlockScroll()
        }

        $body.toggleClass('mobile-nav-open', newState);
        $mobileNav.toggleClass(className + '--visible', newState);

        // enable or disable focus lock to trap keyboard focus inside
        //
        // fixme: will cause $mobileNav to scroll to bottom if scrollbars
        //  are visible when focus is lost. And that happens every time
        //  user is trying to close the menu by clicking on hamburger icon...
        //  This is caused by last element (button) receiving focus.
        if (newState) {
          focusLock.on($mobileNavInner.get(0));
        } else {
          focusLock.off($mobileNavInner.get(0));
        }

        // prepare and play intro animation when menu opens
        if (newState) {
          $mobileNav.addClass(className + '--animate-initial');
          $mobileNav[0].clientWidth; // causing reflow
          $mobileNav.removeClass(className + '--animate-initial');
        }

        $mobileNav.toggleClass(className + '--animate-in', newState);
      }

      // hamburger button toggles the menu
      $hamburgerButton.click(function() {
        toggle();
      });

      // click on any link inside nav menu closes it
      $mobileNav.on('click', 'a, button', function() {
        toggle(false);
      });

      // Every time orientation changes or resized check if we're still in
      // mobile layout and close mobile navigation if we're not
      //
      // Checking this by probing visibility of hamburger menu button
      // which allows us to stay as independent of CSS as possible.
      $(window).on('resize orientationchange', debounce(function() {
        if (isOpen && !$hamburgerButton.is(':visible')) {
          toggle(false);
        }
      }, 35));

      // highlight current/active link in the menu once on page load

      var currentPath = window.location.pathname
        .replace(/\/index.html$/, '/');

      $mobileNav.find(`.${className}__nav-links a`).each(function() {
        var $this = $(this);
        if ($this.attr('href') === currentPath) {
          $this.addClass('active');
        }
      });
    },

    initMobileSlider() {
      // var $mainPageHeader = $('.b-hero-section');
      var $hamburgerButton = $('[data-js-mobile-nav-header-button]');
      var lastState = null;

      var $elementsToProcess = $('[data-js-convert-to-swiper]');

      // var $qiwiInfoCards = $('.b-qiwi-info-cards .cards-wrapper-desktop');
      // var $mainPageHeroSection = $('.b-hero-section__inner .features');

      function handleResize() {
        const isMobile = $hamburgerButton.is(':visible');

        if (lastState === isMobile) return;
        lastState = isMobile;

        $elementsToProcess.each(function() {
          var $elem = $(this);
          var $items = $elem.find($elem.data('js-convert-to-swiper'));
          var slider = $elem.data('slider');

          if (isMobile) {
            if (!slider) {
              slider = new InfoBlockSlider($items, true);
            }

            $elem
              .hide()
              .data('slider', slider)
              .after(slider.getDomNode());

            slider.initialize($elem.data('js-convert-to-swiper-simple') == null);
          } else {
            if (slider) {
              slider.deinitialize();
            }

            $elem
              .show()
              .data('slider', null);
          }
        });
      }

      $(window).resize(handleResize);
      handleResize();
    },
  };

  // On DOM Ready
  $(function() {
    initializers.initLanguageSwitcher();

    initializers.initBackgroundAnimations();
    initializers.initIntegrationsSlider($('[data-js-partners-slider]'));
    initializers.initiContactsPopup();
    initializers.initContactForm();
    initializers.initConsultationForm();
    initializers.initAnalytics();

    initializers.initMobileNav();
    initializers.initMobileSlider();
  });
})();
