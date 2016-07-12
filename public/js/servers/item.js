$(function() {
  var SERVERS_URL = '/servers';
  var LINE_SPLIT_REGEX = /[^\r\n]+/g;

  var serverOptions = $('#script-options');
  var dataFields = $('[data-field]');
  var serverData = serverOptions.data('server');

  dataFields.on('change keyup', function(event) {
    var input = event.target;
    serverData[input.dataset.field] = input.value;
    updateScript();
  });

  var ipAddressGroup = $('#ip-address-group');
  var invalidIP = false;

  ipAddressGroup.find('#ip-address').on('input', function(event) {
    invalidIP = !validator.isIP(this.value);
    ipAddressGroup.toggleClass('has-error', invalidIP);
  });

  var developerPackages = ace.edit('developer-packages');
  developerPackages.setTheme('ace/theme/chrome');

  developerPackages.on('input', function() {
    serverData.developerPackages = developerPackages.getValue();
    updateScript();
  });

  developerPackages.getSession().setMode('ace/mode/sh');

  function bindToView() {
    dataFields.each((_, element) => {
      var value = serverData[element.dataset.field];

      if (value !== void(0)) {
        if (element.dataset.fieldInner) {
          element.innerHTML = value;
        } else {
          element.value = value;
        }
      }
    });

    developerPackages.setValue(serverData.developerPackages || '', 1);
  }

  if (serverData) {
    bindToView();

    new Clipboard('#ssh-key-copy-btn');
  } else {
    serverData = {
      osVersion: 1,
      deployerUser: 'deployer'
    };
  }

  var scriptPreview = ace.edit('script-preview');
  scriptPreview.setTheme('ace/theme/chrome');
  scriptPreview.setReadOnly(true);

  var scriptPreviewSession = scriptPreview.getSession();
  scriptPreviewSession.setMode('ace/mode/sh');

  function updateScript() {
    var scrollTop = scriptPreviewSession.getScrollTop();
    scriptPreview.setValue(Yacom.renderScript(serverData), -1);
    scriptPreviewSession.setScrollTop(scrollTop);
  }

  var emailGroup = $('#email');
  var emailInput = emailGroup.find('input');

  $('#notify-check').click(function(element) {
    if (!element.target.checked) {
      setTimeout(function() {
        emailInput.val('');
        serverData.email = '';
      }, 1000);
    }

    emailGroup.toggleClass('visible');
  });

  serverOptions.find('form:first-child').on('submit', function(event) {
    if (invalidIP) {
      return event.preventDefault();
    }

    var pref = {
      data: {server: serverData}
    };

    if (pref.data.email === '') {
      pref.data.email = null;
    }

    if (serverData.id) {
      pref.type = 'PUT';
      pref.url = SERVERS_URL + '/' + serverData.id;
    } else {
      pref.type = 'POST';
      pref.url = SERVERS_URL;
    }

    $.ajax(pref).success(function(data) {
      if (serverData.id) {
        toastr.success('Saved!');
        bindToView();
      } else {
        location.href = SERVERS_URL + '/' + data.id;
      }
    }).error(function(res) {
      var data = res.responseJSON;

      if (data.type === 'validation') {
        $.each(data.messages, function(_, message) {
          toastr.error(message);
        });
      } else {
        toastr.error('Save error. Try again later.');
      }
    });

    event.preventDefault();
  });

  updateScript();
});
