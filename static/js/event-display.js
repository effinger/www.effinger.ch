const urlVars = getUrlParams();

$(document).ready(function () {
  initializeDisplay();

  // Load and periodically update events.
  loadEvents();
  setInterval(loadEvents, 20000);
});

function initializeDisplay() {
  moment.locale('de');

  // Color theme
  const theme = urlVars['theme'];
  if (theme === 'black') {
    $('body').addClass('theme-black');
  }

  // Vertical alignment.
  const align = urlVars['align'];
  if (align) {
    $('.container').css('height', 'auto');
    if (align === 'bottom') {
      $('.container').css('bottom', '0');
    }
  }

  // Size.
  const size = urlVars['size'];
  if (size === 'large') {
    $('body').addClass('size-large');
  }

  // Keystone correction.
    const keystone = parseFloat(urlVars['keystone']);
  if (keystone) {
    $('.container-outer').css('left', Math.abs(keystone) + 'px');
    $('.container-outer').css('right', Math.abs(keystone) + 'px');
    $('.container-outer').css('transform', 'perspective(5000px) rotateX(' + keystone + 'deg)');
    $('.container-outer').css('height', (100 - keystone / 10) + '%');
  }
}

function loadEvents() {
  // Show loading indicator.
  $('.logo-container').addClass('loading');

  const startOfDay = moment().startOf('day');
  const endOfDay = moment().endOf('day');
  const tzdelta = parseInt(urlVars['timezone']);

  // Set title date of today.
  $('.title').html('Gäste Heute &mdash; ' + startOfDay.format('dd DD.MM.YYYY'));

  $.ajax({
    url: window.BENJIBOOKS_API_URL,
    success: function(data) {
      const events = data.map(function(d) {
        return {
          // TODO: validity tests ?

          roomFloor: d.resource.floor,
          roomName: d.resource.title,

          title: d.title,
          subtitle: d.subtitle,

          // Convert dates
          start: moment(d.start),
          end: moment(d.end),
        };
      });

      // Sort by start time.
      events.sort(function(a, b) {
        return a.start - b.start;
      });

      // Display events in table if we have events.
      if (events.length > 0) {
        let tableContent = '<table class="table room-table"><tbody>';
        events.forEach(function(event) {
          let eventStart = event.start;
          let eventEnd = event.end;

          // Adjust timezone
          if (typeof tzdelta !== 'undefined' && tzdelta) {
            eventStart = eventStart.add(tzdelta, 'hour');
            eventEnd = eventEnd.add(tzdelta, 'hour');

            // Detect Daylight Savings Time
          } else if (eventStart.isDST()) {
            eventStart = eventStart.add(1, 'hour');
            eventEnd = eventEnd.add(1, 'hour');
          }

          if (eventEnd.isBefore()) {
            tableContent += '<tr class="event-ended">';
          } else {
            tableContent += '<tr>';
          }

          tableContent += '<td class="event-time">';
          tableContent +=   eventStart.format('HH:mm') + ' &ndash; ' + eventEnd.format('HH:mm');
          tableContent += '</td>';
          tableContent += '<td>';
          tableContent +=   '<div class="event-title">' + event.title + '</div>';
          tableContent +=   '<div class="event-subtitle">' + event.subtitle + '</div>';
          tableContent += '</td>';
          tableContent += '<td>';
          tableContent +=   '<div class="room-floor">' + event.roomFloor + '</div>';
          tableContent +=   '<div class="room-name">' + event.roomName + '</div>';
          tableContent += '</td>';

          tableContent += '</tr>';
        })
        tableContent += '</tbody></table>';

        $('.center-content').html(tableContent);
      } else {
        // Empty table.
        $('.center-content').html('Extra Raum gewünscht? Gastgeber fragen oder spontan reservieren unter effinger.ch/raeume');
      }

      // Hide loading indicator.
      $('.logo-container').removeClass('loading');
    },
    error: function(err) {
      console.log(this.url);
      console.log('AJAX error in request: ' + JSON.stringify(err, null, 2));
    },
    timeout: 12000,
  });
}

// Read a page's GET URL variables and return them as a map.
function getUrlParams() {
  const params = {};
  const urlParams = window.location.search.slice(1).split('&');
  for (let i = 0, kv; i < urlParams.length; i++) {
    kv = urlParams[i].split('=');
    params[kv[0]] = kv[1];
  }
  return params;
}
