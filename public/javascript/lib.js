// This useful function is from: http://stackoverflow.com/a/439578/223092
function getQueryParams(qs) {
    qs = qs.split('+').join(' ');

    var params = {},
        tokens,
        re = /[?&]?([^=]+)=([^&]*)/g;

    while (tokens = re.exec(qs)) {
        params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
    }

    return params;
}

function getAreasForDisplay(allAreas, term) {
  // Some data sources (just Pombola Popolo JSON exports, as far as I
  // know) include an embedded (and badly named) 'session' attribute
  // to indicate which parliamentary term this is for.  Only look for
  // this attribute if any of areas have this:
  var someWithSession = _.some(allAreas, function(a) {
    return a.session;
  });
  if (someWithSession && term) {
    return _.filter(
      allAreas,
      function (area) {
        return area.session && area.session.slug == term;
      }
    );
  }
  return allAreas;
}

function getEventsForDisplay(allEvents, term) {
  if (term) {
    return _.filter(allEvents, function(event) { return event.id == term });
  }
  return allEvents;
}

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
  var query = getQueryParams(document.location.search);
  var term = null;
  if (query.term) {
    term = query.term;
  }

  // Create some objects for faster lookups by id.
  var membershipsByAreaIdLookup = _.groupBy(
    popolo.memberships,
    function (m) {
      if (m.hasOwnProperty('area_id')) {
        return m.area_id
      } else if (m.hasOwnProperty('area') && m.area) {
        return m.area.id
      }
    }
  );
  var personLookup = popolo.personLookup = _.indexBy(popolo.persons, 'id');
  var groupLookup = popolo.groupLookup = _.indexBy(popolo.organizations, 'id');

  popolo.areas = getAreasForDisplay(popolo.areas, term);
  popolo.events = getEventsForDisplay(popolo.events, term);

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
      // Now obj.memberships is an array of all the memberships in a
      // cell (i.e. all memberships in a particular area during a
      // particular term). They should be ordered by
      // date. Underscore's sortBy is stable, so sort by end_date
      // first, then start_date:
      obj.memberships = _.sortBy(obj.memberships, function (m) { return m.end_date});
      obj.memberships = _.sortBy(obj.memberships, function (m) { return m.start_date});
    });

    area.terms = terms;

    return area;
  });

  return popolo;
}
