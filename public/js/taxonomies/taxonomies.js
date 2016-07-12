$(function() {
  $.fn.dataTable.ext.errMode = 'none';

  var taxonomiesList = $('#taxonomies-list');
  var baseUrl = '/taxonomies/' + taxonomiesList.data('type') + '/';

  var itemTable = taxonomiesList.find('.item-table:first');
  var itemTableDt = itemTable.DataTable({
    columnDefs: [
      {
        targets: [0],
        visible: false
      },
      {
        targets: [2],
        sortable: false
      }
    ]
  });

  function addItem(item) {
    var row = itemTableDt.row.add([item.id, item.name,
      '<button class="btn btn-danger"><i class="fa fa-times"></i></button>'
    ]);
    row.draw(false);

    return row;
  }

  itemTable.on('click', 'button', function(event) {
    var row = itemTableDt.row(this.parentElement);
    var id = itemTableDt.cell(row, 0).data();

    var node = $(row.node());
    node.addClass('saving');

    $.ajax({
      url: baseUrl + id,
      type: 'DELETE'
    }).success(function() {
      row.remove().draw();
    }).error(function() {
      node.removeClass('saving');
      toastr.error('Delete error. Try again later');
    });
  });

  $.each(taxonomiesList.data('items'), function(_, item) {
    addItem(item);
  });

  var addTaxonomy = $('#add-taxonomy');
  var nameInput = addTaxonomy.find('input:first');
  var addBtn = addTaxonomy.find('button:first');

  function createItem() {
    var name = nameInput.val();

    if (name.replace(/\s/g, '').length === 0) {
      return;
    }

    var newItem = {name: name};
    var row = addItem(newItem);

    nameInput.val('');

    var promise = $.post(baseUrl, {taxonomy: newItem}).success(function(data) {
      itemTableDt.cell(row, 0).data(data.id).draw();
    }).error(function() {
      row.remove().draw();
      toastr.error('Save error. Try again later.');
    });

    var rowNode = row.node();

    if (rowNode) {
      rowNode = $(rowNode);
      rowNode.addClass('saving');

      promise.always(function() {
        rowNode.removeClass('saving');
      });
    }
  }

  addBtn.click(createItem);
  nameInput.keypress(function(e) {
    if (e.which === 13) {
      createItem();
    }
  });

});
