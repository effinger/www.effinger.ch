const loadCalendar = function(calendarApiPath, calendarId, roomTitle, roomExtras, roomSetup,
                              calendarElement, loadingElement, detailsElement, dialogElement) {
  const createDetailsContent = function(event) {
    let result = '';
    if (event['title']) {
      result += '\
      <div class="calendar-details-title">Reservationsdetails</div> \
      <div class="calendar-details-content"> \
      ' + event['title'] + ' \
      </div>'
    }
    result += '\
    <div class="calendar-details-title mt-10">Datum</div> \
    <div class="calendar-details-content"> \
    ' + event['start'].format('dddd, Do MMM YYYY') + '\
    </div> \
    <div class="calendar-details-title mt-10">Zeit</div> \
    <div class="calendar-details-content"> \
    ' + event['start'].format('HH:mm') + ' - ' + event['end'].format('HH:mm') + ' Uhr \
    </div> \
    ';
    return result;
  };

  calendarElement.fullCalendar({
    allDaySlot: false,
    businessHours: [
      {
        dow: [1, 2, 3, 4, 5], // Monday, Tuesday,...
        start: '08:00',
        end: '22:00'
      },
      {
        dow: [6], // Saturday
        start: '09:00',
        end: '17:00'
      }
    ],
    defaultView: 'agendaWeek',
    displayEventTime: true,
    displayEventEnd: true,
    editable: false,
    eventLimit: false, // allow "more" link when too many events
    header: {
      left: 'prev,next today',
      center: 'title',
      right: 'month,agendaWeek'
    },
    events: function(start, end, timezone, callback) {
      const xhr = $.ajax({
        url: calendarApiPath,
        data: {
          calendarId: calendarId,
          start: start.toISOString(),
          end: end.toISOString()
        },
        dataType: "jsonp",
        success: function(data) {
          //console.log(this.url);
          //callback(data.results);

          const events = [];

          for (let calendarName in data.results) {

            const calendarEvents = data.results[calendarName];
            for (let i = 0; i < calendarEvents.length; i++) {
              const value = calendarEvents[i];

              // Use "Besetzt".
              let title = "Besetzt";

              // Add hours.
              // var hours = Math.round(moment.duration(moment(value.end).diff(moment(value.start))).asHours());
              // title = hours + ' Std. ' + title;

              const classes = [];
              if (value.provisional) {
                classes.push("provisional");
                title = "(Prov) " + title;
              }
              events.push({
                id: value.id,
                title: title,
                start: value.start,
                end: value.end,
                className: classes
              });
            }
          }

          callback(events);
        },
        error: function (err) {
          console.log(this.url);
          console.log("AJAX error in request: " + JSON.stringify(err, null, 2));
        }
      });
    },
    eventClick: function(event, jsEvent, view) {
      detailsElement.stop(true, true);
      detailsElement.html(createDetailsContent(event)).show();
    },
    eventMouseover: function(event, jsEvent, view) {
      // Don't show for selection helper.
      if (event.className.indexOf('fc-helper') === -1) {
        detailsElement.stop(true, true);
        detailsElement.html(createDetailsContent(event)).show();
      }
    },
    eventMouseout: function(event, jsEvent, view) {
      detailsElement.stop(true, true);
      detailsElement.delay(700).fadeOut(300);
    },
    dayClick: function(date, jsEvent, view) {
      // date.local();
      // date.set({'hour': 0, 'minute': 0, 'second': 0, 'millisecond': 0});
      // var nowM = moment(new Date());
      // nowM.local();
      // nowM.set({'hour': 0, 'minute': 0, 'second': 0, 'millisecond': 0});
      // if (!date.isBefore(nowM)) {
      //   var datum  = date.format('DD.MM.YYYY');
      //   window.location.href='reservation-dialog.html?start='+datum+'&ende='+datum;
      // }
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
    selectable: true,
    selectHelper: true,
    select: function(start, end) {

      // Do nothing when sunday is clicked.
      if (start.isoWeekday() === 7) {
        alert('Sonntag ist unser Ruhetag und steht deshalb im Moment nicht zur Verfügung.')
        return;
      }

      // Set the dialog title.
      dialogElement.find('.calendar-dialog-title').html('Reservation für ' + roomTitle);

      // Set the date and time from the selection.
      dialogElement.find('#res-date').val(start.format('DD.MM.YYYY'));

      if (start.hours() < 8) {
        dialogElement.find('#res-start-time').val('08:00');
      } else if (start.hours() > 22) {
        dialogElement.find('#res-start-time').val('22:00');
      } else {
        dialogElement.find('#res-start-time').val(start.format('HH:mm'));
      }

      if (end.hours() < 9) {
        dialogElement.find('#res-end-time').val('12:00');
      } else if (end.hours() > 23) {
        dialogElement.find('#res-end-time').val('23:00');
      } else {
        dialogElement.find('#res-end-time').val(end.format('HH:mm'));
      }

      // Set the room extras.
      const extrasElement = dialogElement.find('#res-extras');
      extrasElement.empty();
      for (let i = 0; i < roomExtras.length; i++) {
        if (i === 0) {
          extrasElement.append('<label class="form-label">Extras</label>');
        }
        const id = 'extra-' + (i + 1)
        const priceString = roomExtras[i].price ? ' - ' + roomExtras[i].price : '';
        const textAndPrice = roomExtras[i].text + priceString;
        extrasElement.append(
          '<div class="form-check">' +
            '<input class="form-check-input" type="checkbox" id="' + id + '" value="' + textAndPrice + '">' +
            '<label class="form-check-label" for="' + id + '">' + textAndPrice + '</label>' +
          '</div>'
        );
      }

      // Set the room setup.
      if (roomSetup) {
        const setupElement = dialogElement.find('#res-setup');
        setupElement.empty();
        for (let i = 0; i < roomSetup.length; i++) {
          if (i === 0) {
            setupElement.append('<option selected="selected">' + roomSetup[i] + '</option>');
          } else {
            setupElement.append('<option>' + roomSetup[i] + '</option>');
          }
        }
      } else {
        dialogElement.find('#res-setup-container').hide();
      }

      reset();
      dialogElement.modal('show');
    },
    scrollTime: '08:00',
    timezone: 'local'
  });

  // For touch devices - hide on click.
  detailsElement.click(function (event) {
    detailsElement.stop(true, true);
    detailsElement.fadeOut(300);
  });

  // *******************************
  // Handle the reservation.
  // *******************************
  dialogElement.on('click', '#res-save-button', function (e) {
    // Clear invalid markers.
    reset();

    const eventData = {};

    // Get input field values and validate
    // We simply change border color to red if empty field using .css()
    let error = '';

    // Title.
    const resTitle = dialogElement.find('#res-title').val();
    if (!resTitle.trim()) {
      dialogElement.find('#res-title').addClass('invalid');
      error += '<li>Name des Anlasses fehlt</li>';
    }
    eventData.title = resTitle;

    // Start and end dates.
    const resDate = dialogElement.find('#res-date').val();
    const parsedDate = moment(resDate, 'DD.MM.YYYY');
    // Must be valid and not in the past.
    if (parsedDate == null || !parsedDate.isValid() || parsedDate.isBefore(moment().subtract(1, 'day'))) {
      dialogElement.find('#res-date').addClass('invalid');
      error += '<li>Ungültiges Datum</li>';
    }

    if (parsedDate.isoWeekday() == 7) {
      dialogElement.find('#res-date').addClass('invalid');
      error += '<li>Sonntag ist unser Ruhetag und steht deshalb im Moment nicht zur Verfügung.</li>';
    }

    const resStartTime = dialogElement.find('#res-start-time').val();
    let start = moment(resDate + ' ' + resStartTime, 'DD.MM.YYYY HH:mm');

    const resEndTime = dialogElement.find('#res-end-time').val();
    let end = moment(resDate + ' ' + resEndTime, 'DD.MM.YYYY HH:mm');

    // Silently swap if start is after end date.
    if (start.isAfter(end)) {
      const tmpStart = start;
      start = end;
      end = tmpStart;
    }

    // Enforce minimum of 1 hour.
    if (moment.duration(end.diff(start)).asMinutes() < 60) {
      end.minutes(start.minutes() + 60);
    }

    eventData.start = start;
    eventData.end = end;

    // Extras.
    const extras = [];
    dialogElement.find('#res-extras input:checked').each(function () {
      extras.push($(this).val());
    });
    eventData.extras = extras.join(', ');

    // Room setup.
    const resSetup = dialogElement.find('#res-setup').val();
    eventData.setup = resSetup;

    // Visibility (default, private, public).
    // For now, we always set the visibility to calendar default.
    eventData.visibility = 'default';

    // Contact Name.
    const resPersons = dialogElement.find('#res-persons').val();
    if (!resPersons.trim()) {
      dialogElement.find('#res-persons').addClass('invalid');
      error += '<li>Anzahl Personen fehlt</li>';
    }
    eventData.persons = resPersons;

    // Contact Name.
    const resContactName = dialogElement.find('#res-contact-name').val();
    if (!resContactName.trim()) {
      dialogElement.find('#res-contact-name').addClass('invalid');
      error += '<li>Name der Kontaktperson fehlt</li>';
    }
    eventData.contactName = resContactName;

    // Company (optional).
    const resContactCompany = dialogElement.find('#res-contact-company').val();
    eventData.contactCompany = resContactCompany;

    // Email.
    const resContactEmail = dialogElement.find('#res-contact-email').val();
    if (!resContactEmail.trim() || !isEmail(resContactEmail)) {
      dialogElement.find('#res-contact-email').addClass('invalid');
      error += '<li>E-Mail fehlt</li>';
    }
    eventData.contactEmail = resContactEmail;

    // Phone.
    const resContactPhone = dialogElement.find('#res-contact-phone').val();
    if (!resContactPhone.trim()) {
      dialogElement.find('#res-contact-phone').addClass('invalid');
      error += '<li>Telefon fehlt</li>';
    }
    eventData.contactPhone = resContactPhone;

    // Billing Address.
    const resBillingAddress = dialogElement.find('#res-billing-address').val();
    if (!resBillingAddress.trim()) {
      dialogElement.find('#res-billing-address').addClass('invalid');
      error += '<li>Rechnungsadresse fehlt</li>';
    }
    eventData.billingAddress = resBillingAddress;

    // Comments (optional).
    const resComments = dialogElement.find('#res-comments').val();
    eventData.comments = resComments;

    // Submit when valid.
    if (!error) {
      // Reset fields, leave all contact info in the form.
      dialogElement.find('#res-title, #res-date, #res-comments').val('');
      dialogElement.find('#res-extras input').prop('checked', function() {
        return this.defaultChecked;
      });
      dialogElement.find('#res-start-time option, #res-end-time option').prop('selected', function() {
        return this.defaultSelected;
      });

      submitNewEvent(eventData);

      // Show the success message.
      dialogElement.find('#calendar-dialog-form-content').hide();
      dialogElement.find('#calendar-dialog-success-content').show();

      calendarElement.fullCalendar('unselect');
    } else {
      // Show validation error message.
      dialogElement.find('#validation-error-message .error-details').html(error);
      dialogElement.find('#validation-error-message').show();
    }
  });

  function reset() {
    dialogElement.find('.invalid').removeClass('invalid');
    dialogElement.find('#validation-error-message').hide();
    dialogElement.find('#calendar-dialog-success-content').hide();
    dialogElement.find('#calendar-dialog-form-content').show();
  }

  function isEmail(email) {
    const regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return regex.test(email);
  }

  function submitNewEvent(eventData) {
    // Convert the date to ISO String.
    eventData.start = eventData.start.toISOString();
    eventData.end = eventData.end.toISOString();

    // POST-like request from GET via "_method" parameter,
    // to be cross-origin friendly.
    const xhr = $.ajax({
      method: "GET",
      url: calendarApiPath,
      data: {
        _method: "POST",
        calendarId: calendarId,
        event: JSON.stringify(eventData)
      },
      dataType: "jsonp",
      success: function(data) {
        // Refetch events to show that our event is now visible.
        calendarElement.fullCalendar('refetchEvents');

        // console.log(this.url);
        // console.log(JSON.stringify(data));
      }
    });
  }
}
