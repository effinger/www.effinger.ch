const loadScheduler = function(resources, events, calendarElement, loadingElement, detailsElement) {

  const createDetailsContent = function(event) {

    // Remove leading and trailing line breaks from description.
    let description = '-';
    if (event['description']) {
      const regex = /^\s*(?:<br\s*\/?\s*>)+|(?:<br\s*\/?\s*>)+\s*$/gi;
      description = event['description'].replace(regex, '');
    }

    const resource = calendarElement.fullCalendar('getEventResource', event);
    const resourceTitle = resource.title;

    const result = '\
    <div class="calendar-details-title">Titel</div> \
    <div class="calendar-details-content"> \
    ' + event['title'] + ' \
    </div>\
    <div class="calendar-details-title mt-10">Datum</div> \
    <div class="calendar-details-content"> \
    ' + event['start'].format('dddd, Do MMM YYYY') + '<br>\
    ' + event['start'].format('HH:mm') + ' - ' + event['end'].format('HH:mm') + ' Uhr \
    </div> \
    <div class="calendar-details-title mt-10">Raum</div> \
    <div class="calendar-details-content"> \
    ' + resource.title + '\
    </div> \
    <div class="calendar-details-title mt-10">Details</div> \
    <div class="calendar-details-content"> \
    ' + description + '\
    </div>\
    ';
    return result;
  };

  calendarElement.fullCalendar({
    schedulerLicenseKey: 'CC-Attribution-NonCommercial-NoDerivatives',
    defaultView: 'timelineDay',
    displayEventTime: true,
    displayEventEnd: true,
    editable: false,
    eventLimit: false, // allow "more" link when too many events
    header: {
      left: 'prev,next today',
      center: 'title',
      right: 'timelineDay,agendaWeek'
    },
    resources: resources,
    events: events,
    eventClick: function(event, jsEvent, view) {
      detailsElement.stop(true, true);
      detailsElement.html(createDetailsContent(event)).show();
    },
    loading: function(isLoading) {
      if (isLoading) {
        loadingElement.show();
      } else {
        loadingElement.hide();
      }
    },
    locale: 'de',
    navLinks: false, // can click day/week names to navigate views
    resourceLabelText: 'Räume',
    selectable: false,
    scrollTime: '08:00',
    timezone: 'local'
  });

  // For touch devices - hide on click.
  detailsElement.on("click", function (event) {
    detailsElement.stop(true, true);
    detailsElement.fadeOut(300);
  });
}
