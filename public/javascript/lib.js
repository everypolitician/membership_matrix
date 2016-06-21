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
