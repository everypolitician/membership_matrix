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
    var memberships_by_area_id = _.groupBy(data.memberships, 'area_id');
    var people_by_id = _.indexBy(data.persons, 'id');
    var groups_by_id = _.indexBy(data.organizations, 'id');

    var tableHtml = renderTemplate('template-table', {
      terms: events,
      rows: _.map(data.areas, function(area){

        var area_memberships = memberships_by_area_id[area.id];

        var area_memberships_by_term = _.map(events, function(event){
          return {
            legislative_period_id: event.id,
            memberships: _.filter(area_memberships, function(membership){
              return membership.legislative_period_id === event.id;
            })
          }
        });

        _.each(area_memberships_by_term, function(obj){
          _.each(obj.memberships, function(membership){
            membership.person = people_by_id[membership.person_id];
            membership.group = groups_by_id[membership.on_behalf_of_id];
          });
        });

        return {
          area: area,
          area_memberships_by_term: area_memberships_by_term
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

    var settings = {
      personName: $person.find('.person__name').text(),
      personGroup: $person.find('.person__group').text()
    }

    $person.remove();

    var html = renderTemplate('template-person', settings);
    $(html).prependTo($pg).clone().prependTo($pg);
  });

  $(document).on('click', '.js-remove-person', function(){
    var $person = $(this).parents('.person');
    $person.remove();
  });

  $(document).on('click', '.js-save-person', function(){
    var $popover = $(this).parents('.popover');
    var $person = $popover.data('person');

    var thing_to_send = {
      before: {
        person_id: $person.data('person_id'),
        on_behalf_of_id: $person.data('on_behalf_of_id'),
        area_id: $person.data('area_id'),
        legislative_period_id: $person.data('legislative_period_id')
      },
      after: {
        person_id: $popover.find('#person_id').val(),
        on_behalf_of_id: $popover.find('#on_behalf_of_id').val(),
        area_id: $person.data('area_id'),
        legislative_period_id: $person.data('legislative_period_id')
      }
    }

    console.log(thing_to_send);
  });

});
