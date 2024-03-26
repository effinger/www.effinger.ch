/*
The browser that is used on the current screenly devices (for the beamer in the Kaffeebar and the screen in 1. OG)
is terribly old and incompatible with most modern TLS/HTML/CSS/JS features. The user agent says:
"Mozilla/5.0 (X11; Linux armv6l) AppleWebKit/538.15 (KHTML, like Gecko) Version/8.0 Safari/538.15"
-> So a Safari 8 ?! Or Chromium 8? Or Chrome 28?
*/

(function($){
  "use strict"; // Start of use strict

  var urlParams = getUrlParams()
  var theme = urlParams['theme']
  var align = urlParams['align']
  var size = urlParams['size']
  var keystone = parseFloat(urlParams['keystone'])
  // Temporary fix for the problem that the displays are showing the wrong time after the end of daylight savings time.
  var tzdelta = 0 // parseInt(urlParams['timezone'])
  var autodst = parseInt(urlParams['autodst'])

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

    refreshClock()
  }

  function refreshClock() {
    // console.log("renderClock", moment().format('HH:mm:ss.SSS'))

    $('.clock').html(
      moment().format('HH') +
      '<span class="time-separator">:</span>' +
      moment().format('mm')
    )

    var tillEndOfMinute = moment().endOf('minute').diff(moment());
    setTimeout(refreshClock, tillEndOfMinute + 100)
  }

  function compareBookings(a, b) {
    var aIsFuture = a.start.isAfter() && 1 || 0
    var bIsFuture = b.start.isAfter() && 1 || 0

    if (aIsFuture && bIsFuture) {
      return a.start.diff(b.start) || a.end.diff(b.end)
    } else if (!aIsFuture && !bIsFuture) {
      return a.end.diff(b.end) || a.start.diff(b.start)
    } else {
      return aIsFuture - bIsFuture
    }
  }

  function loadBookings() {
    // Show a subtle loading indicator.
    $('.logo-container').addClass('loading')

    // Update the on-page title to show today's date.
    var startOfDay = moment().startOf('day')
    $('.title #date-today').html(startOfDay.format('dd DD.MM.YYYY'))

    $.ajax({
      url: window.BENJIBOOKS_API_URL,
      success: function(data) {
        var bookings = data.map(parseBooking)
        bookings = joinMultiRoomBookings(bookings)

        bookings.sort(compareBookings)

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
    if (typeof tzdelta !== 'undefined' && Number.isInteger(tzdelta)) {
      // Manual correction
      booking.start = booking.start.add(tzdelta, 'hour')
      booking.end = booking.end.add(tzdelta, 'hour')
    }

    if (typeof autodst !== 'undefined' && booking.start.isDST()) {
      // Apply Daylight Savings Time
      booking.start = booking.start.add(1, 'hour')
      booking.end = booking.end.add(1, 'hour')
    }

    return booking
  }

  function joinMultiRoomBookings(bookings) {
    return bookings.reduce(function(groupedBookings, booking){
      var sameBooking = groupedBookings.find((b) =>
        b.title === booking.title &&
        b.subtitle === booking.subtitle &&
        b.start.toISOString() === booking.start.toISOString() &&
        b.end.toISOString() === booking.end.toISOString()
      )

      if (sameBooking) {
        if (!sameBooking.roomFloors.includes(booking.roomFloor)) sameBooking.roomFloors.push(booking.roomFloor)
        sameBooking.roomNames.push(booking.roomName)
      } else {
        var newUniqueBooking = {
          title: booking.title,
          subtitle: booking.subtitle,
          start: booking.start,
          end: booking.end,
          roomFloors: [booking.roomFloor],
          roomNames: [booking.roomName],
        }
        groupedBookings.push(newUniqueBooking)
      }
      return groupedBookings
    }, [])
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
    html +=   '<td>'
    html +=     '<div class="booking-time">' + booking.start.format('HH:mm') + ' &ndash; ' + booking.end.format('HH:mm') + '</div>'
    html +=   '</td>'
    html +=   '<td>'
    html +=     '<div class="booking-title">' + booking.title + '</div>'
    html +=     '<div class="booking-subtitle">' + booking.subtitle + '</div>'
    html +=   '</td>'
    html +=   '<td>'
    html +=     '<div class="room-floor">' + booking.roomFloors.join(", ") + '</div>'
    html +=     '<div class="room-name">' + booking.roomNames.join(",<br />") + '</div>'
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
