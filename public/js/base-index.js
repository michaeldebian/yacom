$(function() {

  $('#data-table').DataTable({
    columnDefs: [{
      targets: "datatable-nosort",
      orderable: false
    }]
  });

});
