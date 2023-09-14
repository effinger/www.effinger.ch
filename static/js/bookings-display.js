/*
The browser that is used on the current screenly devices (for the beamer in the Kaffeebar and the screen in 1. OG)
is terribly old and incompatible with most modern TLS/HTML/CSS/JS features. The user agent says:
Mozilla/5.0 (X11; Linux armv6l) AppleWebKit/538.15 (KHTML, like Gecko) Version/8.0 Safari/538.15
*/

(function($){
  "use strict"; // Start of use strict

  var urlParams = getUrlParams()
  var theme = urlParams['theme']
  var align = urlParams['align']
  var size = urlParams['size']
  var keystone = parseFloat(urlParams['keystone'])
  var tzdelta = parseInt(urlParams['timezone'])

  $(document).ready(function () {
    initializeDisplay()

    // Load and periodically update bookings.
    loadBookings()
    setInterval(loadBookings, 33000)
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

    var startOfDay = moment().startOf('day')
    var endOfDay = moment().endOf('day')

    // Update the on-page title to show today's date.
    $('.title #date-today').html(startOfDay.format('dd DD.MM.YYYY'))

    $.ajax({
      url: window.BENJIBOOKS_API_URL,
      success: function(data) {
        var bookings = data.map(parseBooking)

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
    var booking = {
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

    var rowClasses = ['booking']
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
    var title = booking.title || ""
    return title.match(/brownbag/i)
  }

  // Read a page's URL search params and return them as a map.
  function getUrlParams() {
    var params = {}
    var urlParams = window.location.search.slice(1).split('&')
    for (var i = 0, kv; i < urlParams.length; i++) {
      kv = urlParams[i].split('=')
      params[kv[0]] = kv[1]
    }
    return params
  }

})(jQuery); // End of use strict
