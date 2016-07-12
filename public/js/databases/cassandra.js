$(function() {
  var CASSANDRA_URL = '/databases/cassandra/';
  var KEYSPACE_URL = CASSANDRA_URL + 'keyspaces';
  var USERS_URL = CASSANDRA_URL + 'users';
  var ASSIGN_U2KS_URL = KEYSPACE_URL + '/users';
  var RUN_CQL_URL = CASSANDRA_URL + 'cql';
  var PROMOTE_SCHEMA_URL = CASSANDRA_URL + 'promote';

  var currentAction;

  var actionCombo = $('#action');

  actionCombo.change(function() {
    if (currentAction) {
      currentAction.slideUp();
    }

    if (this.value === -1) {
      currentAction = null;
      return;
    }

    currentAction = $('#' + this.value + '-form');
    currentAction.slideDown();
  });

  function runAction(sendReq) {
    return function() {
      toastr.options.timeOut = 0;
      toastr.info('Running...');

      sendReq().success(function() {
        toastr.clear();
        toastr.options.timeOut = 5000;
        toastr.success('Success!');
        actionCombo.val(-1);
        currentAction.slideUp();
      }).error(function(res) {
        var err = res.responseJSON;

        toastr.remove();
        toastr.options.timeOut = 7000;
        toastr.error((err && err.message) || 'Error. Try again later.');
      });
    }
  }

  // Create user
  $('#create-user').click(runAction(function() {
    return $.post(USERS_URL, {
      name: $('#username').val(),
      password: $('#password').val()
    });
  }));

  // Run CQL
  var cqlCode = ace.edit('cql-code');
  cqlCode.setTheme('ace/theme/chrome');
  cqlCode.getSession().setMode('ace/mode/sql');

  $('#run-cql').click(runAction(function() {
    return $.ajax({
      url: RUN_CQL_URL,
      type: 'PUT',
      data: {
        username: $('#rcql-username').val(),
        password: $('#rcql-password').val(),
        cql: cqlCode.getValue()
      }
    });
  }));

  // Assign user to keyspace
  $('#assign-u2ks').click(runAction(function() {
    return $.post(ASSIGN_U2KS_URL, {
      username: $('#u2ks-username').val(),
      keyspace: $('#u2ks-keyspace').val()
    });
  }));

  // Promote schema
  var currentEnv = $('#current-env');
  var toEnv = $('#to-env');

  var changeOrder = ['development', 'qa', 'production'];

  currentEnv.change(function() {
    toEnv.val(changeOrder[changeOrder.indexOf(this.value) + 1]);
  });

  $('#promote-schema').click(runAction(function() {
    return $.post(PROMOTE_SCHEMA_URL, {
      currentEnv: currentEnv.val(),
      keyspace: $('#promote-schema-keyspace').val()
    });
  }));

  // Create keyspace
  var keyspaceUsersContainer = $('#keyspace-form .form-groups:first-child');

  var userHTML = '<div class="row user-item">' +
    '<div class="row col-lg-11">' +
      '<div class="col-lg-6 form-group">' +
        '<input placeholder="Username" class="user-username form-control">' +
      '</div>' +
      '<div class="col-lg-6 form-group">' +
        '<input type="password" placeholder="Password (ignore if existent)" class="user-password form-control">' +
      '</div>' +
    '</div>' +
    '<button class="btn btn-danger col-lg-1 delete-user-item" type="button">' +
      '<i class="fa fa-times"></i>' +
    '</button>' +
  '</div>';

  $('#add-user').click(function() {
    keyspaceUsersContainer.append(userHTML);
  });

  $(document).on('click', '.delete-user-item', function() {
    $(this).parents('.user-item').remove();
  });

  $('#create-keyspace').click(runAction(function() {
    var keyspaceData = {
      name: $('#keyspace-name').val(),
      users: []
    };

    keyspaceUsersContainer.find('.user-item').each(function(_, item) {
      var $item = $(item);

      keyspaceData.users.push({
        name: $item.find('.user-username:first-child').val(),
        password: $item.find('.user-password:first-child').val()
      });
    });

    return $.post(KEYSPACE_URL, keyspaceData);
  }));

});
