$(document).ready(function () {
  initializeDisplay();

  // Periodically update events.
  setInterval(function () {
    loadEvents();
  }, 20000);
  loadEvents();
});

function initializeDisplay() {
  moment.locale("de");
  var urlVars = getUrlVars();

  // Color theme
  var theme = urlVars["theme"];
  if (theme) {
    if (theme === "black") {
      $("body").addClass("theme-black");
    }
  }

  // Vertical alignment.
  var align = urlVars["align"];
  if (align) {
    $(".container").css("height", "auto");
    if (align === "bottom") {
      $(".container").css("bottom", "0");
    }
  }

  // Size.
  var size = urlVars["size"];
  if (size) {
    if (size === "large") {
      $("body").addClass("size-large");
    }
  }

  // Keystone correction.
  var keystone = urlVars["keystone"];
  if (keystone) {
    $(".container-outer").css("left", Math.abs(keystone) + "px");
    $(".container-outer").css("right", Math.abs(keystone) + "px");
    $(".container-outer").css("transform", "perspective(5000px) rotateX(" + keystone + "deg)");
    $(".container-outer").css("height", 100 - keystone / 10 + "%");
  }

  // Time zone correction
  var tzdelta = urlVars["timezone"];
}

function loadEvents() {
  // Show loading indicator.
  $(".logo-container").addClass("loading");

  var startOfDay = moment().startOf("day");
  var endOfDay = moment().endOf("day");

  // Set title date of today.
  $(".title").html("Gäste Heute &mdash; " + startOfDay.format("dd DD.MM.YYYY"));

  var calendarApiPath = DISPLAY_API_URL;
  var xhr = $.ajax({
    url: calendarApiPath,
    /*
      data: {
        calendarId: '{{ delimit .Params.calendarIds "," }}',
        start: startOfDay.toISOString(),
        end: endOfDay.toISOString()
      },
      dataType: "jsonp",
      */
    success: function (data) {
      var events = [];

      // Iterate through benjibooks API events
      data.forEach(function (d) {
        events.push({
          // TODO: validity tests ?

          roomFloor: d.resource.floor,
          roomName: d.resource.title,

          title: d.title,
          subtitle: d.subtitle,

          // Convert dates
          start: moment(d.start),
          end: moment(d.end),
        });
      });

      // Sort by start time.
      events.sort(function (a, b) {
        return a.start - b.start;
      });

      // Display events in table if we have events.
      if (events.length > 0) {
        var tableContent = "<table class='table room-table'><tbody>";
        for (var i = 0; i < events.length; i++) {
          var event = events[i];

          var eventStart = event.start;
          var eventEnd = event.end;

          // Adjust manually
          if (typeof tzdelta !== "undefined" && tzdelta) {
            tzdelta = parseInt(tzdelta);
            eventStart = eventStart.add(tzdelta, "hour");
            eventEnd = eventEnd.add(tzdelta, "hour");

            // Detect Daylight Savings Time
          } else if (eventStart.isDST()) {
            eventStart = eventStart.add(1, "hour");
            eventEnd = eventEnd.add(1, "hour");
          }

          if (eventEnd.isBefore()) {
            tableContent += "<tr class='event-ended'>";
          } else {
            tableContent += "<tr>";
          }

          let trClasses = [];
          if (event.title.toLocaleLowerCase().includes("brownbag")) trClasses.push("brownbag");
          if (eventEnd.isBefore()) trClasses.push("event-ended");
          tableContent += `<tr class="${trClasses.join(" ")}">`;
          

          tableContent +=
            "<td class='event-time'>" + eventStart.format("HH:mm") + " &ndash; " + eventEnd.format("HH:mm") + "</td>";
          tableContent += "<td>";
          tableContent += "<div class='event-title'>" + event.title + "</div>";
          tableContent += "<div class='event-subtitle'>" + event.subtitle + "</div>";
          tableContent += "</td>";
          tableContent += "<td>";
          tableContent += "<div class='room-floor'>" + event.roomFloor + "</div>";
          tableContent += "<div class='room-name'>" + event.roomName + "</div>";
          tableContent += "</td>";

          tableContent += "</tr>";
        }
        tableContent += "</tbody></table>";

        $(".content").html(tableContent);
      } else {
        // Empty table.
        $(".content").html("Extra Raum gewünscht? Gastgeber fragen oder spontan reservieren unter effinger.ch/raeume");
      }

      // Hide loading indicator.
      $(".logo-container").removeClass("loading");
    },
    error: function (err) {
      console.log(this.url);
      console.log("AJAX error in request: " + JSON.stringify(err, null, 2));
    },
    timeout: 12000, // Set timeout.
  });
}

// Read a page's GET URL variables and return them as an associative array.
function getUrlVars() {
  var vars = [],
    hash;
  var hashes = window.location.href.slice(window.location.href.indexOf("?") + 1).split("&");
  for (var i = 0; i < hashes.length; i++) {
    hash = hashes[i].split("=");
    vars.push(hash[0]);
    vars[hash[0]] = hash[1];
  }
  return vars;
}
