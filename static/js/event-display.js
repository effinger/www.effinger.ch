const urlParams = getUrlParams()
const theme = urlParams['theme']
const align = urlParams['align']
const size = urlParams['size']
const keystone = parseFloat(urlParams['keystone'])
const tzdelta = parseInt(urlParams['timezone'])

$(document).ready(function () {
  initializeDisplay()

  // Load and periodically update events.
  loadEvents()
  setInterval(loadEvents, 20000)
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
        .css('left', `${Math.abs(keystone)}px'`)
        .css('right', `${Math.abs(keystone)}px'`)
        .css('transform', `perspective(5000px) rotateX(${keystone}deg)`)
        .css('height', `${100 - keystone / 10}%`)
  }
}

function loadEvents() {
  // Show loading indicator.
  $('.logo-container').addClass('loading')

  const startOfDay = moment().startOf('day')
  const endOfDay = moment().endOf('day')

  // Set title date of today.
  $('.title').html(`Gäste Heute &mdash; ${startOfDay.format('dd DD.MM.YYYY')}`)

  $.ajax({
    url: window.BENJIBOOKS_API_URL,
    success: function(data) {
      const events = data.map(parseEvent)

      events.sort(function(a, b) {
        return a.start - b.start
      })

      // Display events in table if we have events.
      if (events.length > 0) {
        $('.center-content').html(eventsTable(events))
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
      console.log(`AJAX error in request: ${JSON.stringify(err, null, 2)}`)
    },
    timeout: 12000,
  })
}

function parseEvent(eventData) {
  const event = {
    // TODO: validity tests ?

    roomFloor: eventData.resource.floor,
    roomName: eventData.resource.title,

    title: eventData.title,
    subtitle: eventData.subtitle,

    // Convert dates
    start: moment(eventData.start),
    end: moment(eventData.end),
  }

  // Adjust timezone
  if (typeof tzdelta !== 'undefined' && tzdelta) {
    event.start = event.start.add(tzdelta, 'hour')
    event.end = event.end.add(tzdelta, 'hour')

    // Detect Daylight Savings Time
  } else if (event.start.isDST()) {
    event.start = event.start.add(1, 'hour')
    event.end = event.end.add(1, 'hour')
  }

  return event
}

function eventsTable(events) {
  return `
    <table class="table events-table">
    <tbody>
      ${events.map(eventRow).join("")}
    </tbody>
    </table>
  `
}

function eventRow(event) {
  const rowClasses = ['event']
  if (event.end.isBefore()) rowClasses.push('ended')
  if (isBrownbag(event)) rowClasses.push('brownbag')

  return `
   <tr class="${rowClasses.join(' ')}">
     <td>
       <div class="event-time">${event.start.format('HH:mm')}&nbsp;&ndash; ${event.end.format('HH:mm')}</div>
     </td>
     <td>
       <div class="event-title">${event.title}</div>
       <div class="event-subtitle">${event.subtitle}</div>
     </td>
     <td>
       <div class="room-floor">${event.roomFloor}</div>
       <div class="room-name">${event.roomName}</div>
     </td>
   </tr>
  `
}

function isBrownbag(event) {
  return event.title.toLocaleLowerCase().includes('brownbag')
}

// Read a page's URL search params and return them as a map.
function getUrlParams() {
  const params = {}
  const urlParams = window.location.search.slice(1).split('&')
  for (let i = 0, kv; i < urlParams.length; i++) {
    kv = urlParams[i].split('=')
    params[kv[0]] = kv[1]
  }
  return params
}
