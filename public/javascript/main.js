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
};

function mungePopolo(popolo) {
  // Create some objects for faster lookups by id.
  var membershipsByAreaIdLookup = _.groupBy(popolo.memberships, 'area_id');
  var personLookup = popolo.personLookup = _.indexBy(popolo.persons, 'id');
  var groupLookup = popolo.groupLookup = _.indexBy(popolo.organizations, 'id');

  popolo.areas = _.map(_.sortBy(popolo.areas, function(area) { return area.name; }), function(area){
    var terms = _.map(popolo.events, function(event){
      return {
        legislative_period_id: event.id,
        memberships: _.filter(membershipsByAreaIdLookup[area.id], function(membership){
          return membership.legislative_period_id === event.id;
        })
      };
    });

    _.each(terms, function(obj){
      _.each(obj.memberships, function(membership){
        membership.person = personLookup[membership.person_id];
        membership.group = groupLookup[membership.on_behalf_of_id];
      });
    });

    area.terms = terms;

    return area;
  });

  return popolo;
}

$(function(){

  $.ajax({
    url: 'https://cdn.rawgit.com/everypolitician/everypolitician-data/9bc5709/data/Australia/Representatives/ep-popolo-v1.0.json',
    dataType: 'json'
  }).done(function(popolo){
    var data = window.data = mungePopolo(popolo);
    var tableHtml = renderTemplate('template-table', {
      terms: data.events,
      areas: data.areas
    });
    var $table = $(tableHtml);

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
        var membership = $person.data('membership');
        return renderTemplate('template-edit-person', {
          people: data.persons,
          organizations: _.where(data.organizations, {classification: 'party'}),
          membership: membership
        });
      }

    }).on('show.bs.popover', function(e){
      // Remove existing popovers on the page
      $('.popover').each(function(){
        var $person = $(this).data('bs.popover').$element;
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
      var $person = $(this).data('bs.popover').$element;
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
    var membership = $person.data('membership');
    delete membership.person;
    delete membership.group;
    membership.person_id = null;
    membership.on_behalf_of_id = null;
    membership.start_date = null;
    membership.end_date = null;
    $person.data('membership', membership);
    $person.hide();
  });

  $(document).on('click', '.js-save-person', function(){
    var $popover = $(this).parents('.popover');
    var $person = $popover.data('person');
    $person.popover('hide');

    var membership = $person.data('membership');
    membership.person_id = $popover.find('#person_id').val();
    membership.on_behalf_of_id = $popover.find('#on_behalf_of_id').val();
    membership.start_date = $popover.find('#start_date').val();
    membership.end_date = $popover.find('#end_date').val();
    membership.person = data.personLookup[membership.person_id];
    membership.group = data.groupLookup[membership.on_behalf_of_id];

    $person.replaceWith($(renderTemplate('template-membership', {membership: membership})));
  });

  $(document).on('click', '.js-save-csv', function(e) {
    e.preventDefault();
    window.location = "data:text/csv," + encodeURIComponent(
      Papa.unparse($('.person:not(.person--new)').map(function() {
        var membership = $(this).data('membership');
        return _.omit(membership, ['person', 'group']);
      }).toArray())
    );
  });

  $(document).on('click', '.js-save', function(e) {
    e.preventDefault();
    var csv = Papa.unparse($('.person:not(.person--new)').map(function() {
      var membership = $(this).data('membership');
      return _.omit(membership, ['person', 'group']);
    }).toArray());
    $.ajax({
      url: 'http://localhost:9292/memberships',
      method: 'POST',
      data: csv,
      processData: false,
      cache: false
    }).success(function() {
      console.log("Successfully saved");
    }).error(function(xhr, status, err) {
      console.error(status, err);
    });
  });
});