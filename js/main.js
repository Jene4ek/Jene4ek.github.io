$(function() {
  // add API url
  var API_URL = '.../api';

  var DELAY_SUCCESS_MESSAGE = 2000;

  var $button = $('button[class="_1_kc0"]');
  var $successMessage = $('div[class="success-message not-display"]');
  var $form = $('form');
  var $formInputs = $form.find('input:not([type="submit"]), textarea');

  function disableForm() {
    $formInputs.prop('readOnly', true);
    $button.addClass('disabled');
  }

  function enableForm() {
    $formInputs.prop('readOnly', false);
    $button.removeClass('disabled');
  }

  function displaySuccessMessage() {
    $form.addClass('not-display');
    $successMessage.removeClass('not-display');
  }

  function hideSuccessMessage() {
    $form.removeClass('not-display');
    $successMessage.addClass('not-display');
  }

  $form.submit(function(e) {
    e.preventDefault();

    disableForm();

    var values = {}; 
    $formInputs.each(function() {
      values[this.name] = $(this).val();
    });

    if (!e.originalEvent.isTrusted || values.email || values.title) {
      $form[0].reset();
    } else {
      $.ajax({
        type: "POST",
        url: API_URL + '/contact-form',
        data: {
        name: values.name,
        website: values.website,
        contacts: values.contacts,
        message: values.message,
        },
        success: function() {
          enableForm();
          $form[0].reset();

          displaySuccessMessage();

          setTimeout(function() {
            hideSuccessMessage();
          }, DELAY_SUCCESS_MESSAGE);
        },
        error: function(response) {
          enableForm();

          if (response && response.responseJSON) {
            alert('Server returned an error: ' + response.responseJSON.message);
          } else {
            alert('Failed to submit the form.\nPlease try again later.');
          }
        },
      });
    }
  });

  var $servicesTextMenu = $('li[id="comp-ifgfo9dg1"]');
  var $menuItems = $('div[class="menu-items not-display"]');
  var wasMouseOverOnMenuItems = false;

  function hideMenuItems() {
    $menuItems.addClass("not-display");
    wasMouseOverOnMenuItems = false;
  }

  window.addEventListener('scroll', hideMenuItems);

  $servicesTextMenu.mouseover(function() {
    $menuItems.removeClass("not-display");
  });

  $menuItems.mouseover(function() {
    wasMouseOverOnMenuItems = true;
  });

  if (wasMouseOverOnMenuItems) {
    $menuItems.mouseout(function() {
      hideMenuItems();
    });  
  } else {
    $servicesTextMenu.mouseout(function() {
      hideMenuItems();
    });
  }
});
