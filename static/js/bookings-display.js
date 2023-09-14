(function($){
  "use strict"; // Start of use strict

  const urlParams = getUrlParams()
  const theme = urlParams['theme']
  const align = urlParams['align']
  const size = urlParams['size']
  const keystone = parseFloat(urlParams['keystone'])
  const tzdelta = parseInt(urlParams['timezone'])

  $(document).ready(function () {
    initializeDisplay()

    $('.bottom-content').html(
      '<div style="color: grey;">' +
      '<code>' + window.BENJIBOOKS_API_URL  + '</code><br>' +
      '<code>' + window.navigator.userAgent + '</code><br>' +
      '</div>'
    )

    // Load and periodically update bookings.
    loadBookings()
    setInterval(loadBookings, 20000)
  })

  function initializeDisplay() {
    moment.locale('de')

    // Color theme
    if (theme === 'black') {
      $('body').addClass('theme-black')
    }

    // Vertical alignment.
    if (align) {
      $('.container').css('height', 'auto')
      if (align === 'bottom') {
        $('.container').css('bottom', '0')
      }
    }

    // Size.
    if (size === 'large') {
      $('body').addClass('size-large')
    }

    // Keystone correction.
    if (keystone) {
      $('.container-outer')
          .css('left', Math.abs(keystone) + 'px')
          .css('right', Math.abs(keystone) + 'px')
          .css('transform', 'perspective(5000px) rotateX(' + keystone + 'deg)')
          .css('height', '' + (100 - keystone / 10) + '%')
    }
  }

  function loadBookings() {
    // Show a subtle loading indicator.
    $('.logo-container').addClass('loading')

    const startOfDay = moment().startOf('day')
    const endOfDay = moment().endOf('day')

    // Update the on-page title to show today's date.
    $('.title #date-today').html(startOfDay.format('dd DD.MM.YYYY'))

    $.ajax({
      url: window.BENJIBOOKS_API_URL,
      success: function(data) {
        const bookings = data.map(parseBooking)

        bookings.sort(function(a, b) {
          return a.start - b.start
        })

        // Display bookings in table if we have any.
        if (bookings.length > 0) {
          $('.center-content').html(bookingsTable(bookings))
        } else {
          // Empty table.
          $('.center-content').html(
            '<p>Extra Raum gewünscht? Gastgeber fragen oder spontan reservieren unter effinger.ch/raeume</p>'
          )
        }

        // Hide loading indicator.
        $('.logo-container').removeClass('loading')
      },
      error: function(err) {
        console.log(this.url)
        console.log('AJAX error in request: ' + JSON.stringify(err, null, 2))
      },
      timeout: 12000,
    })
  }

  function parseBooking(bookingData) {
    const booking = {
      // TODO: validity tests ?

      roomFloor: bookingData.resource.floor,
      roomName: bookingData.resource.title,

      title: bookingData.title,
      subtitle: bookingData.subtitle,

      // Convert dates
      start: moment(bookingData.start),
      end: moment(bookingData.end),
    }

    // Adjust timezone
    if (typeof tzdelta !== 'undefined' && tzdelta) {
      booking.start = booking.start.add(tzdelta, 'hour')
      booking.end = booking.end.add(tzdelta, 'hour')

      // Detect Daylight Savings Time
    } else if (booking.start.isDST()) {
      booking.start = booking.start.add(1, 'hour')
      booking.end = booking.end.add(1, 'hour')
    }

    return booking
  }

  function bookingsTable(bookings) {
    var html = ''
    html += '<table class="table bookings-table">'
    html += '<tbody>'
    html +=   bookings.map(bookingRow).join('')
    html += '</tbody>'
    html += '</table>'
    return html
  }

  function bookingRow(booking) {
    var html = ''

    const rowClasses = ['booking']
    if (booking.end.isBefore()) rowClasses.push('ended')
    if (isBrownbag(booking)) rowClasses.push('brownbag')

    html += '<tr class="' + rowClasses.join(' ') + '">'
    html +=   '<td class="booking-time">'
    html +=     booking.start.format('HH:mm') + ' &ndash; ' + booking.end.format('HH:mm')
    html +=   '</td>'
    html +=   '<td>'
    html +=     '<div class="booking-title">' + booking.title + '</div>'
    html +=     '<div class="booking-subtitle">' + booking.subtitle + '</div>'
    html +=   '</td>'
    html +=   '<td>'
    html +=     '<div class="room-floor">' + booking.roomFloor + '</div>'
    html +=     '<div class="room-name">' + booking.roomName + '</div>'
    html +=   '</td>'
    html += '</tr>'

    return html
  }

  function isBrownbag(booking) {
    return booking.title.toLocaleLowerCase().includes('brownbag')
  }

  // Read a page's URL search params and return them as a map.
  function getUrlParams() {
    const params = {}
    const urlParams = window.location.search.slice(1).split('&')
    for (var i = 0, kv; i < urlParams.length; i++) {
      kv = urlParams[i].split('=')
      params[kv[0]] = kv[1]
    }
    return params
  }

})(jQuery); // End of use strict
