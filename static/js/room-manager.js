var loadCalendar = function(calendarApiPath, calendarId, roomTitle, roomExtras,
    calendarElement, loadingElement, detailsElement, dialogElement) {
  var createDetailsContent = function(event) {
    var result = '';
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
        dow: [ 1, 2, 3, 4, 5 ], // Monday, Tuesday,...
        start: '08:00',
        end: '22:00'
      },
      {
        dow: [ 6 ], // Saturday
        start: '09:00',
        end: '17:00'
      }
    ],
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
      var xhr = $.ajax({
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

          var events = [];
          $.each(data.results, function(index, value) {
            // Use "Besetzt" if title is empty.
            var title;
            if (value.title.trim()) {
              title = value.title;
            } else {
              title = 'Besetzt';
            }

            // Add hours.
            // var hours = Math.round(moment.duration(moment(value.end).diff(moment(value.start))).asHours());
            // title = hours + ' Std. ' + title;

            var classes = [];
            if (value.provisional) {
              classes.push('provisional');
              title = '(Prov) ' + title;
            }
            events.push({
              id: value.id,
              title: title,
              start: value.start,
              end: value.end,
              className: classes
            });
          });
          callback(events);
        },
        error: function (err) {
          console.log(this.url);
          console.log("AJAX error in request: " + JSON.stringify(err, null, 2));
        }
      });
    },
    eventClick: function( event, jsEvent, view ) {
      detailsElement.stop(true, true);
      detailsElement.html(createDetailsContent(event)).show();
    },
    eventMouseover: function( event, jsEvent, view ) {
      // Don't show for selection helper.
      if (event.className.indexOf('fc-helper') == -1) {
        detailsElement.stop(true, true);
        detailsElement.html(createDetailsContent(event)).show();
      }
    },
    eventMouseout: function( event, jsEvent, view ) {
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
      // Set the dialog title.
      dialogElement.find('#calendar-dialog-title').html('Reservation für ' + roomTitle);

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

      // Set the extras.
      var extrasElement = dialogElement.find('#res-extras');
      extrasElement.empty();
      for (var i = 0; i < roomExtras.length; i++) {
        if (i == 0) {
          extrasElement.append('<label>Extras</label>');
        }
        var priceString = roomExtras[i].price ? ' - ' + roomExtras[i].price : '';
        var textAndPrice = roomExtras[i].text + priceString;
        extrasElement.append(
          '<div class="checkbox">\
            <label>\
              <input type="checkbox" value="' + textAndPrice + '">' + textAndPrice + '\
            </label>\
          </div>'
        );
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

    var eventData = {};

    // Get input field values and validate
    // We simply change border color to red if empty field using .css()
    var valid = true;

    // Title.
    var resTitle = dialogElement.find('#res-title').val();
    if (!resTitle.trim()) {
      dialogElement.find('#res-title').addClass('invalid');
      valid = false;
    }
    eventData.title = resTitle;

    // Start and end dates.
    var resDate = dialogElement.find('#res-date').val();
    var parsedDate = moment(resDate, 'DD.MM.YYYY');
    // Must be valid and not in the past.
    if (parsedDate == null || !parsedDate.isValid() || parsedDate.isBefore(moment().subtract(1, 'day'))) {
      dialogElement.find('#res-date').addClass('invalid');
      valid = false;
    }

    var resStartTime = dialogElement.find('#res-start-time').val();
    var start = moment(resDate + ' ' + resStartTime, 'DD.MM.YYYY HH:mm');

    var resEndTime = dialogElement.find('#res-end-time').val();
    var end = moment(resDate + ' ' + resEndTime, 'DD.MM.YYYY HH:mm');

    // Silently swap if start is after end date.
    if (start.isAfter(end)) {
      var tmpStart = start;
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
    var extras = [];
    dialogElement.find('#res-extras input:checked').each(function() {
      extras.push($(this).val());
    });
    eventData.extras = extras.join(', ');

    // Price level.
    //var resPriceLevel = dialogElement.find('#res-price-level').val();
    //eventData.priceLevel = resPriceLevel;

    // Visibility (default, private, public).
    // For now, we always set the visibility to private.
    eventData.visibility = 'private';

    // Contact Name.
    var resPersons = dialogElement.find('#res-persons').val();
    if (!resPersons.trim()) {
      dialogElement.find('#res-persons').addClass('invalid');
      valid = false;
    }
    eventData.persons = resPersons;

    // Contact Name.
    var resContactName = dialogElement.find('#res-contact-name').val();
    if (!resContactName.trim()) {
      dialogElement.find('#res-contact-name').addClass('invalid');
      valid = false;
    }
    eventData.contactName = resContactName;

    // Company (optional).
    var resContactCompany = dialogElement.find('#res-contact-company').val();
    eventData.contactCompany = resContactCompany;

    // Street.
    var resContactStreet = dialogElement.find('#res-contact-street').val();
    if (!resContactStreet.trim()) {
      dialogElement.find('#res-contact-street').addClass('invalid');
      valid = false;
    }
    eventData.contactStreet = resContactStreet;

    // Zip.
    var resContactZip = dialogElement.find('#res-contact-zip').val();
    if (!resContactZip.trim()) {
      dialogElement.find('#res-contact-zip').addClass('invalid');
      valid = false;
    }
    eventData.contactZip = resContactZip;

    var resContactCity = dialogElement.find('#res-contact-city').val();
    if (!resContactCity.trim()) {
      dialogElement.find('#res-contact-city').addClass('invalid');
      valid = false;
    }
    eventData.contactCity = resContactCity;

    // Email.
    var resContactEmail = dialogElement.find('#res-contact-email').val();
    if (!resContactEmail.trim() || !isEmail(resContactEmail)) {
      dialogElement.find('#res-contact-email').addClass('invalid');
      valid = false;
    }
    eventData.contactEmail = resContactEmail;

    // Phone.
    var resContactPhone = dialogElement.find('#res-contact-phone').val();
    if (!resContactPhone.trim()) {
      dialogElement.find('#res-contact-phone').addClass('invalid');
      valid = false;
    }
    eventData.contactPhone = resContactPhone;

    // Comments (optional).
    var resComments = dialogElement.find('#res-comments').val();
    eventData.comments = resComments;

    // Submit when valid.
    if (valid) {
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
    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return regex.test(email);
  }

  function submitNewEvent(eventData) {
    // Convert the date to ISO String.
    eventData.start = eventData.start.toISOString();
    eventData.end = eventData.end.toISOString();

    // POST-like request from GET via "_method" parameter,
    // to be cross-origin friendly.
    var xhr = $.ajax({
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
