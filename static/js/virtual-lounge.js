// Virtual Coworking Lounge script (used during Corona).
// 
// It loads the last 20 images from an imgur album and displays
// them in a slide show.

// This is the HTML that was used:
//
// <div class="row">
//   <div class="col-md-6">
//     <a id="lounge-link" href="https://meet.jit.si/effinger-lounge" target="_blank" title="Lounge beitreten" class="relative block">
//       <img src="lounge.jpg" alt="" id="lounge-img">
//       <div id="lounge-live-icon" class="live__icon" style="position: absolute; right: -5px; top: 0px; display: none">
//         <div class="circle--outer"></div>
//         <div class="circle--inner"></div>
//         <p>LIVE</p>
//       </div>
//     </a>
//     <div id="lounge-img-updated" class="small text-right"></div>
//     </div>
//     <div class="col-md-6">
//     <p class="mb-10">
//       Klicke auf den Knopf und triff uns in der virtuellen Lounge.
//     </p>
//     <p class="mb-10">
//       <a href="https://meet.jit.si/effinger-lounge" target="_blank" class="btn btn-mod btn-border btn-large btn-round">
//         <i class="fa fa-hand-o-right"></i> Effinger Lounge öffnen
//       </a>
//     </p>
//     <p class="small mb-10">
//       <i class="fa fa-user fa-fw"></i> Manchmal ist ein Effinger Host hier<br>
//       <i class="fa fa-coffee fa-fw"></i> Um 10 Uhr findet die Kaffeepause statt<br>
//       <i class="fa fa-chrome fa-fw"></i> Nutze am besten den <a target="_blank" href="https://www.google.com/chrome/">Chrome Browser</a>
//     </p>
//     <p class="small mb-20">
//       <em>Falls du niemanden siehst oder nur das Effinger-Logo, lade am besten jemanden ein.</em><br>
//       <em>Bei Fragen: <a href="mailto:coworking@effinger.ch">coworking@effinger.ch</a></em>
//     </p>
//     <p class="mb-10">
//       Weitere Räume für private Gespräche
//     </p>
//     
//     <div class="mb-0">
//       <a href="https://meet.jit.si/effinger-besprechung" target="_blank">Besprechungsraum</a>
//       <small>für eigene Meetings</small><br>
//     </div>
//     <div class="mb-0">
//       <a href="https://meet.jit.si/colearningbern" target="_blank">Colearning-Raum</a>
//       <small>für Colearner und Bildungsfreunde</small>
//     </div>
//     <div class="mb-0">
//       <a href="https://meet.jit.si/" target="_blank">Eigenen Raum erstellen</a>
//       <small>Namen wählen und Link teilen</small>
//     </div>
//   </div>
// </div>

function showLoungeImage(image) {
  $("#lounge-img").attr("src", "https://i.imgur.com/" + image.id + "l.jpg");

  // Calculate time diff in hours and minutes.
  var imgTime = new Date(image.datetime * 1000);
  var now = new Date();

  var diff = (now.getTime() - imgTime.getTime()) / 3600000; // this is a time in hours

  var diffText = "";
  var live = false;
  if (diff > 48) {
    diffText = "vor " + Math.floor(diff / 24) + " Tagen";
  } else if (diff > 24) {
    diffText = "vor 1 Tag";
  } else if (diff >= 2) {
    diffText = "vor " + Math.floor(diff) + " Stunden";
  } else if (diff >= 1) {
    diffText = "vor 1 Stunde";
  } else {
    diff = diff * 60; // time in minutes

    if (diff < 5) {
      live = true;
    }

    if (diff >= 2) {
      diffText = "vor " + Math.floor(diff) + " Minuten";
    } else if (diff >= 1) {
      diffText = "vor 1 Minute";
    } else {
      diffText = "vor einigen Sekunden";
    }
  }

  if (live) {
    $("#lounge-live-icon").show();
  } else {
    $("#lounge-live-icon").hide();
  }

  $("#lounge-img-updated").text(diffText);
}

function showLoungeImageSlideshow(images) {
  var limitedReversedImages = images.slice(0, 20).reverse();
  for (var i = 0; i < limitedReversedImages.length; i++) {
    setTimeout(function (image) {
      showLoungeImage(image);
    }, i * 320, limitedReversedImages[i]);
  }
}

function loadLoungeImages(slideshow) {
  $.ajax({
    type: "GET",
    url: "https://api.imgur.com/3/album/1zfAbLG/images",
    dataType: 'json',
    headers: {
      "Authorization": "Client-ID 23dcbdb52b4fadc"
    },
    success: function (result) {
      if (result.data) {
        result.data.sort(function (a, b) {
         return b.datetime - a.datetime;
        });

        if (slideshow) {
          if ('IntersectionObserver' in window) {
            // IntersectionObserver Supported
            // Show slideshow when in view.
            var config = {
                  root: null,
                  rootMargin: '0px',
                  threshold: 0.7
                };

            var observer = new IntersectionObserver(onChange, config);
            observer.observe(document.querySelector("#lounge-link"));

            function onChange(changes, observer) {
              changes.forEach(function (change) {
                if (change.intersectionRatio > 0) {
                  // Stop watching and show slideshow.
                  showLoungeImageSlideshow(result.data);
                  observer.unobserve(change.target);
                }
              });
            }

          } else {
            // IntersectionObserver NOT Supported
            // Show slideshow after a few seconds.
            setTimeout(function () {
              showLoungeImageSlideshow(result.data);
            }, 3000);
          }
        } else {
          // No slide show. Just show the latest image.
          showLoungeImage(result.data[0]);
        }
      }
    }
  });
}

setInterval(loadLoungeImages, 30000);
loadLoungeImages(true);