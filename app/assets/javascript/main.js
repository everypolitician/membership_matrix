var renderTemplate = function renderTemplate(templateName, data){
  data = data || {};
  var source = $('#' + templateName);
  if(source.length){
    return _.template( source.html() )(data);
  } else {
    throw 'renderTemplate Error: Could not find source template with matching #' + templateName;
  }
}

$(function(){

  // "events" is terms

  $.ajax({
    url: 'https://cdn.rawgit.com/everypolitician/everypolitician-data/74d4f01/data/Germany/Bundestag/ep-popolo-v1.0.json',
    dataType: 'json'
  }).done(function(data){
    console.log(data);

    var tableHtml = renderTemplate('template-table', {
      terms: data.events.reverse()
    });
    $(tableHtml).prependTo('.site-content');

    var $table = $('#table').DataTable({
      paging: false,
      ordering: false,
      fixedHeader: true,
      // fixedColumns: true,
      // scrollY: '100%',
      // scrollX: '100%',
      // scrollCollapse: true,
      dom: "tr" // https://datatables.net/reference/option/dom
    });

    $table.on('click', '.person', function(){
      // $(this).popover('toggle');
      $(this).parents('.person-group').toggleClass('person-group--active');
    });
  });

  $('.person').popover({
    template: '<div class="popover"><div class="arrow"></div><div class="popover-content"></div></div>',
    placement: "bottom",
    html: true,
    selector: ".person",
    container: "body",
    content: function(){
      var $person = $(this);
      var content = '';
      var personName = $person.find('.person__name').text();
      var personGroup = $person.find('.person__group').text();
      content += '<div class="form-group"><label for="name">Name:</label><input id="name" class="form-control" value="' + personName + '"></div>';
      content += '<div class="form-group"><label for="group">Group:</label><input id="group" class="form-control" value="' + personGroup + '"></div>';
      content += '<div class="form-group"><label for="fromdate">From date:</label><input id="fromdate" class="form-control"></div>';
      content += '<div class="form-group"><label for="todate">To date:</label><input id="todate" class="form-control"></div>';
      content += '<button class="btn btn-primary btn-block">Save</button>'
      return content;
    }
  }).on('shown.bs.popover', function(){
    $('#name').focus();
  });

  $table.on('click', '.person', function(){
    $(this).popover('toggle');
    $(this).parents('.person-group').toggleClass('person-group--active');
  });
});
