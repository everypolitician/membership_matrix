var renderTemplate = function renderTemplate(templateName, data){
  data = data || {};
  data = _.extend(data, {
    renderTemplate: renderTemplate
  });
  var source = $('#' + templateName);
  if(source.length){
    return _.template( source.html() )(data);
  } else {
    throw 'renderTemplate Error: Could not find source template with matching #' + templateName;
  }
}

$(function(){

  $.ajax({
    url: 'https://cdn.rawgit.com/everypolitician/everypolitician-data/9bc5709/data/Australia/Representatives/ep-popolo-v1.0.json',
    dataType: 'json'
  }).done(function(data){
    console.log(data);

    var events = data.events.reverse();
    var membershipsByAreaIdLookup = _.groupBy(data.memberships, 'area_id');
    var personLookup = _.indexBy(data.persons, 'id');
    var groupLookup = _.indexBy(data.organizations, 'id');
    var areas = _.sortBy(data.areas, function(area) { return area.name; });

    var tableHtml = renderTemplate('template-table', {
      terms: events,
      rows: _.map(areas, function(area){

        var areaMemberships = membershipsByAreaIdLookup[area.id];

        var membershipsByTerm = _.map(events, function(event){
          return {
            legislative_period_id: event.id,
            memberships: _.filter(areaMemberships, function(membership){
              return membership.legislative_period_id === event.id;
            })
          }
        });

        _.each(membershipsByTerm, function(obj){
          _.each(obj.memberships, function(membership){
            membership.person = personLookup[membership.person_id];
            membership.group = groupLookup[membership.on_behalf_of_id];
          });
        });

        return {
          area: area,
          membershipsByTerm: membershipsByTerm
        }

      })
    });
    var $table = $(tableHtml)

    $table.prependTo('.site-content');
    $table.DataTable({
      paging: false,
      ordering: false,
      fixedHeader: true,
      // fixedColumns: true,
      // scrollY: '100%',
      // scrollX: '100%',
      // scrollCollapse: true,
      dom: "tr" // https://datatables.net/reference/option/dom
    });

    $('.person').popover({
      template: renderTemplate('template-popover'),
      placement: "bottom",
      html: true,
      container: "body",
      content: function(){
        var $person = $(this);
        return renderTemplate('template-edit-person', {
          people: data.persons,
          organizations: data.organizations, // TODO: this also contains the legislature!!
          person_id: $person.data('person_id'),
          on_behalf_of_id: $person.data('on_behalf_of_id')
        });
      }

    }).on('show.bs.popover', function(e){
      // Remove existing popovers on the page
      $('.popover').each(function(){
        $person = $(this).data('bs.popover').$element;
        $person.popover('hide');
      });

    }).on('shown.bs.popover', function(e){
      var $person = $(this);
      var $popover = $(this).data('bs.popover').$tip;
      $popover.data('person', $person);
      // Can't split or remove new people
      if( $person.is('.person--new') ){
        $popover.find('.popover-footer').remove();
      }
      $person.parents('.person-group').addClass('person-group--active');
      $person.find('#name').focus();

    }).on('hide.bs.popover', function(e){
      $person = $(this).data('bs.popover').$element;
      $person.parents('.person-group').removeClass('person-group--active');

    });
  });



  $(document).on('click', '.js-split-person', function(){
    var $popover = $(this).parents('.popover');
    var $person = $popover.data('person');
    var $pg = $person.parents('.person-group');

    $person.popover('hide');

    $pg.append( $person.clone() );
  });

  $(document).on('click', '.js-remove-person', function(){
    var $popover = $(this).parents('.popover');
    var $person = $popover.data('person');
    $person.popover('destroy');
    $person.remove();
  });

  $(document).on('click', '.js-save-person', function(){
    var $popover = $(this).parents('.popover');
    var $person = $popover.data('person');

    var existing_person_id = $person.data('person_id');
    var existing_on_behalf_of_id = $person.data('on_behalf_of_id');

    var payload = {
      'new': {
        person_id: $popover.find('#person_id').val(),
        on_behalf_of_id: $popover.find('#on_behalf_of_id').val(),
        area_id: $person.data('area_id'),
        legislative_period_id: $person.data('legislative_period_id')
      }
    }

    if(existing_person_id || existing_on_behalf_of_id){
      payload.old = {
        person_id: existing_person_id,
        on_behalf_of_id: existing_on_behalf_of_id,
        area_id: $person.data('area_id'),
        legislative_period_id: $person.data('legislative_period_id')
      }
    }

    // TODO: This needs to be sent somewhere!
    console.log(payload);

    // TODO: The DOM needs to be updated to reflect the change.
  });

  $(document).on('click', '.js-save-csv', function(e) {
    e.preventDefault();
    window.location = "data:text/csv," + encodeURIComponent(
      Papa.unparse($('.person:not(.person--new)').map(function() {
        var data = $(this).data();
        delete data['bs.popover'];
        return data;
      }).toArray())
    );
  });
});
