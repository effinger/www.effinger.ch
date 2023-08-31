(function($){
  "use strict"; // Start of use strict


  /* ---------------------------------------------
     Scripts initialization
     --------------------------------------------- */

  $(window).load(function(){

    init_scroll_navigate();

    $(window).trigger("scroll");
    $(window).trigger("resize");

    // Hash menu forwarding
    if ((window.location.hash) && ($(window.location.hash).length)){
      const hash_offset = $(window.location.hash).offset().top;
      $("html, body").animate({
        scrollTop: hash_offset
      });
    }

  });

  $(document).ready(function(){

    $(window).trigger("resize");
    init_classic_menu();
    init_lightbox();
    // init_parallax();
    init_shortcodes();
    init_tooltips();
    init_counters();
    init_team();
    initPageSliders();
    //initWorkFilter();
    init_wow();
    //init_masonry();
  });

  $(window).resize(function(){

    init_classic_menu_resize();
    js_height_init();

  });


  /* --------------------------------------------
     Platform detect
     --------------------------------------------- */
  let mobileTest;
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
    mobileTest = true;
    $("html").addClass("mobile");
  }
  else {
    mobileTest = false;
    $("html").addClass("no-mobile");
  }

  var mozillaTest;
  if (/mozilla/.test(navigator.userAgent)) {
    mozillaTest = true;
  }
  else {
    mozillaTest = false;
  }
  var safariTest;
  if (/safari/.test(navigator.userAgent)) {
    safariTest = true;
  }
  else {
    safariTest = false;
  }

  // Detect touch devices
  if (!("ontouchstart" in document.documentElement)) {
    document.documentElement.className += " no-touch";
  }


  /* ---------------------------------------------
     Sections helpers
     --------------------------------------------- */

  // Sections backgrounds

  const pageSection = $(".home-section, .page-section, .small-section, .split-section");
  pageSection.each(function(_index){

    if ($(this).attr("data-background")){
      $(this).css("background-image", "url(" + $(this).data("background") + ")");
    }
  });

  // Function for block height 100%
  function height_line(height_object, height_donor){
    height_object.height(height_donor.height());
    height_object.css({
      "line-height": height_donor.height() + "px"
    });
  }

  // Function equal height
  !function(a){
    a.fn.equalHeights = function(){
      let b = 0;
      const c = a(this);
      return c.each(function(){
        const c = a(this).innerHeight();
        c > b && (b = c)
      }), c.css("height", b)
    }, a("[data-equal]").each(function(){
      const b = a(this), c = b.data("equal");
      b.find(c).equalHeights()
    })
  }(jQuery);


  // Progress bars
  const progressBar = $(".progress-bar");
  progressBar.each(function(indx){
    $(this).css("width", $(this).attr("aria-valuenow") + "%");
  });



  /* ---------------------------------------------
     Nav panel classic
     --------------------------------------------- */

  const mobile_nav = $(".mobile-nav");
  const desktop_nav = $(".desktop-nav");

  function init_classic_menu_resize(){

    // Mobile menu max height
    $(".mobile-on .desktop-nav > ul").css("max-height", $(window).height() - $(".main-nav").height() - 20 + "px");

    // Mobile menu style toggle
    if ($(window).width() <= 1024) {
      $(".main-nav").addClass("mobile-on");
    }
    else if ($(window).width() > 1024) {
      $(".main-nav").removeClass("mobile-on");
    }
  }

  function init_classic_menu(){

    // Transparent menu
    if ($(".main-nav").hasClass("transparent")){
      $(".main-nav").addClass("js-transparent");
    }

    $(window).scroll(function(){
      if ($(window).scrollTop() > 10) {
        $(".js-transparent").removeClass("transparent");
        $(".main-nav").addClass("small-height");
      }
      else {
        $(".js-transparent").addClass("transparent");
        $(".main-nav").removeClass("small-height");
      }
    });

    // Mobile menu toggle
    mobile_nav.click(function(){

      if (desktop_nav.hasClass("js-opened")) {
        desktop_nav.slideUp(400, "easeOutExpo", function() {
          desktop_nav.removeClass("js-opened");
          desktop_nav.css('display', '');
        });
        $(this).removeClass("active");
      }
      else {
        desktop_nav.slideDown(400, "easeOutQuart").addClass("js-opened");
        $(this).addClass("active");

        // Fix for responsive menu
        if ($(".main-nav").hasClass("not-top")) {
          $(window).scrollTo(".main-nav", "slow");
        }
      }
    });

    desktop_nav.find("a:not(.mn-has-sub)").click(function(){
      if (mobile_nav.hasClass("active")) {
        desktop_nav.slideUp("slow", "easeOutExpo").removeClass("js-opened");
        mobile_nav.removeClass("active");
      }
    });


    // Sub menu

    const mnHasSub = $(".mn-has-sub");
    let mnThisLi;

    $(".mobile-on .mn-has-sub").find(".fa-angle-right:first").removeClass("fa-angle-right").addClass("fa-angle-down");

    mnHasSub.click(function(){

      if ($(".main-nav").hasClass("mobile-on")) {
        mnThisLi = $(this).parent("li:first");
        if (mnThisLi.hasClass("js-opened")) {
          mnThisLi.find(".mn-sub:first").slideUp(function(){
            mnThisLi.removeClass("js-opened");
            mnThisLi.find(".mn-has-sub").find(".fa-angle-up:first").removeClass("fa-angle-up").addClass("fa-angle-down");
          });
        }
        else {
          $(this).find(".fa-angle-down:first").removeClass("fa-angle-down").addClass("fa-angle-up");
          mnThisLi.addClass("js-opened");
          mnThisLi.find(".mn-sub:first").slideDown();
        }

        return false;
      }
    });

    mnThisLi = mnHasSub.parent("li");
    mnThisLi.hover(function(){

      if (!($(".main-nav").hasClass("mobile-on"))) {
        $(this).find(".mn-sub:first").stop(true, true).fadeIn("fast");
      }

    }, function(){
      if (!($(".main-nav").hasClass("mobile-on"))) {
        $(this).find(".mn-sub:first").stop(true, true).delay(100).fadeOut("fast");
      }
    });

  }



  /* ---------------------------------------------
     Scroll navigation
     --------------------------------------------- */

  function init_scroll_navigate(){

    $(".local-scroll").localScroll({
      target: "body",
      duration: 1200,
      offset: 0,
      easing: "easeInOutExpo"
    });

    const sections = $(".home-section, .split-section, .page-section");
    const menu_links = $(".scroll-nav li a");

    $(window).scroll(function(){

      sections.filter(":in-viewport:first").each(function(){
        const active_section = $(this);
        const active_link = $('.scroll-nav li a[href="#' + active_section.attr("id") + '"]');
        menu_links.removeClass("active");
        active_link.addClass("active");
      });

    });

  }



  /* ---------------------------------------------
     Lightboxes
     --------------------------------------------- */

  function init_lightbox(){

    // Works Item Lightbox
    $(".work-lightbox-link").magnificPopup({
      gallery: {
        enabled: true
      },
      mainClass: "mfp-fade"
    });

    // Works Item Lightbox
    $(".lightbox-gallery-1").magnificPopup({
      gallery: {
        enabled: true
      }
    });

    // Other Custom Lightbox
    $(".lightbox-gallery-2").magnificPopup({
      gallery: {
        enabled: true
      }
    });
    $(".lightbox-gallery-3").magnificPopup({
      gallery: {
        enabled: true
      }
    });
    $(".lightbox").magnificPopup();

  }



  /* -------------------------------------------
     Parallax
     --------------------------------------------- */

  function init_parallax(){

    // Parallax
    if (($(window).width() >= 1024) && (mobileTest == false)) {
      $(".parallax-1").parallax("50%", 0.1);
      $(".parallax-2").parallax("50%", 0.2);
      $(".parallax-3").parallax("50%", 0.3);
      $(".parallax-4").parallax("50%", 0.4);
      $(".parallax-5").parallax("50%", 0.5);
      $(".parallax-6").parallax("50%", 0.6);
      $(".parallax-7").parallax("50%", 0.7);
      $(".parallax-8").parallax("50%", 0.5);
      $(".parallax-9").parallax("50%", 0.5);
      $(".parallax-10").parallax("50%", 0.5);
      $(".parallax-11").parallax("50%", 0.05);
    }
  }



  /* ---------------------------------------------
     Shortcodes
     --------------------------------------------- */
  // Tabs minimal
  function init_shortcodes(){

    let tpl_tab_height;
    $(".tpl-minimal-tabs > li > a").click(function(){

      if (!($(this).parent("li").hasClass("active"))) {
        tpl_tab_height = $(".tpl-minimal-tabs-cont > .tab-pane").filter($(this).attr("href")).height();
        $(".tpl-minimal-tabs-cont").animate({
          height: tpl_tab_height
        }, function(){
          $(".tpl-minimal-tabs-cont").css("height", "auto");
        });

      }

    });

    // Accordion
    const allPanels = $(".accordion > dd").hide();
    allPanels.first().slideDown("easeOutExpo");
    $(".accordion > dt > a").first().addClass("active");

    $(".accordion > dt > a").click(function(){

      const current = $(this).parent().next("dd");
      $(".accordion > dt > a").removeClass("active");
      $(this).addClass("active");
      allPanels.not(current).slideUp("easeInExpo");
      $(this).parent().next().slideDown("easeOutExpo");

      return false;

    });

    // Toggle
    const allToggles = $(".toggle > dd").hide();

    $(".toggle > dt > a").click(function(){

      if ($(this).hasClass("active")) {

        $(this).parent().next().slideUp("easeOutExpo");
        $(this).removeClass("active");

      }
      else {
        const current = $(this).parent().next("dd");
        $(this).addClass("active");
        $(this).parent().next().slideDown("easeOutExpo");
      }

      return false;
    });

  }



  /* ---------------------------------------------
     Tooltips (bootstrap plugin activated)
     --------------------------------------------- */

  function init_tooltips(){

    $(".tooltip-bot, .tooltip-bot a, .nav-social-links a").tooltip({
      placement: "bottom"
    });

    $(".tooltip-top, .tooltip-top a").tooltip({
      placement: "top"
    });

    $(".marker a").tooltip({
      placement: "bottom"
    });

  }



  /* ---------------------------------------------
     Some facts section
     --------------------------------------------- */

  function init_counters(){
    $(".count-number").appear(function(){
      const count = $(this);
      count.countTo({
        from: 0,
        to: count.html(),
        speed: 523,
        refreshInterval: 50,
        formatter: function (value, options) {
          //return value.toFixed(options.decimals);
          return value.toFixed(options.decimals).replace(/\B(?=(\d{3})+(?!\d))/g, "'");
        }
      });
    });
  }


  /* ---------------------------------------------
     Team
     --------------------------------------------- */

  function init_team(){

    // Hover
    $(".team-item").click(function(){
      if ($("html").hasClass("mobile")) {
        $(this).toggleClass("js-active");
      }
    });

  }


})(jQuery); // End of use strict


/* ---------------------------------------------
 Sliders
 --------------------------------------------- */
function initPageSliders(){
  (function($){
    "use strict";

    // Fullwidth slider
    $(".fullwidth-slider").owlCarousel({
      slideSpeed: 350,
      singleItem: true,
      autoHeight: true,
      navigation: true,
      navigationText: ["<i class='fa fa-angle-left'></i>", "<i class='fa fa-angle-right'></i>"]
    });

    // Fullwidth slider
    $(".fullwidth-slider-fade").owlCarousel({
      transitionStyle: "fadeUp",
      slideSpeed: 350,
      singleItem: true,
      autoHeight: true,
      navigation: true,
      navigationText: ["<i class='fa fa-angle-left'></i>", "<i class='fa fa-angle-right'></i>"]
    });

    // Fullwidth gallery
    $(".fullwidth-gallery").owlCarousel({
      transitionStyle: "fade",
      autoPlay: 5000,
      slideSpeed: 700,
      singleItem: true,
      autoHeight: true,
      navigation: false,
      pagination: false
    });

    // Item carousel
    $(".item-carousel").owlCarousel({
      autoPlay: 2500,
      //stopOnHover: true,
      items: 3,
      itemsDesktop: [1199, 3],
      itemsTabletSmall: [768, 3],
      itemsMobile: [480, 1],
      navigation: false,
      navigationText: ["<i class='fa fa-angle-left'></i>", "<i class='fa fa-angle-right'></i>"]
    });

    // Item carousel
    $(".small-item-carousel").owlCarousel({
      autoPlay: 2500,
      stopOnHover: true,
      items: 6,
      itemsDesktop: [1199, 4],
      itemsTabletSmall: [768, 3],
      itemsMobile: [480, 2],
      pagination: false,
      navigation: false,
      navigationText: ["<i class='fa fa-angle-left'></i>", "<i class='fa fa-angle-right'></i>"]
    });

    // Single carousel
    $(".single-carousel").owlCarousel({
      singleItem: true,
      autoHeight: true,
      navigation: true,
      navigationText: ["<i class='fa fa-angle-left'></i>", "<i class='fa fa-angle-right'></i>"]
    });

    // Content Slider
    $(".content-slider").owlCarousel({
      slideSpeed: 350,
      singleItem: true,
      autoHeight: true,
      navigation: true,
      navigationText: ["<i class='fa fa-angle-left'></i>", "<i class='fa fa-angle-right'></i>"]
    });

    // Photo slider
    $(".photo-slider").owlCarousel({
      slideSpeed: 350,
      items: 4,
      itemsDesktop: [1199, 4],
      itemsTabletSmall: [768, 2],
      itemsMobile: [480, 1],
      autoHeight: true,
      navigation: true,
      navigationText: ["<i class='fa fa-angle-left'></i>", "<i class='fa fa-angle-right'></i>"]
    });

    // Work slider
    $(".work-full-slider").owlCarousel({
      slideSpeed : 350,
      singleItem: true,
      autoHeight: true,
      navigation: true,
      navigationText: ["<i class='fa fa-angle-left'></i>", "<i class='fa fa-angle-right'></i>"]
    });

    // Blog posts carousel
    $(".blog-posts-carousel").owlCarousel({
      autoPlay: 5000,
      stopOnHover: true,
      items: 3,
      itemsDesktop: [1199, 3],
      itemsTabletSmall: [768, 2],
      itemsMobile: [480, 1],
      pagination: false,
      navigation: true,
      navigationText: ["<i class='fa fa-angle-left'></i>", "<i class='fa fa-angle-right'></i>"]
    });

    // Blog posts carousel alt
    $(".blog-posts-carousel-alt").owlCarousel({
      autoPlay: 3500,
      stopOnHover: true,
      slideSpeed: 350,
      singleItem: true,
      autoHeight: true,
      pagination: false,
      navigation: true,
      navigationText: ["<i class='fa fa-angle-left'></i>", "<i class='fa fa-angle-right'></i>"]
    });

    // Image carousel
    $(".image-carousel").owlCarousel({
      autoPlay: 5000,
      stopOnHover: true,
      items: 4,
      itemsDesktop: [1199, 3],
      itemsTabletSmall: [768, 2],
      itemsMobile: [480, 1],
      navigation: true,
      navigationText: ["<i class='fa fa-angle-left'></i>", "<i class='fa fa-angle-right'></i>"]
    });

    // Fullwidth slideshow

    const sync1 = $(".fullwidth-slideshow");
    const sync2 = $(".fullwidth-slideshow-pager");

    $(".fullwidth-slideshow").owlCarousel({
      autoPlay: 5000,
      stopOnHover: true,
      transitionStyle: "fade",
      slideSpeed: 350,
      singleItem: true,
      autoHeight: true,
      pagination: false,
      navigation: true,
      navigationText: ["<i class='fa fa-angle-left'></i>", "<i class='fa fa-angle-right'></i>"],
      afterAction : syncPosition,
      responsiveRefreshRate : 200
    });
    $(".fullwidth-slideshow-pager").owlCarousel({
      autoPlay: 5000,
      stopOnHover: true,
      items: 8,
      itemsDesktop: [1199,8],
      itemsDesktopSmall: [979,7],
      itemsTablet: [768,6],
      itemsMobile: [480,4],
      autoHeight: true,
      pagination: false,
      navigation: false,
      responsiveRefreshRate : 100,
      afterInit : function(el){
        el.find(".owl-item").eq(0).addClass("synced");
      }
    });

    function syncPosition(el){
      const current = this.currentItem;
      $(".fullwidth-slideshow-pager").find(".owl-item").removeClass("synced").eq(current).addClass("synced")
      if ($(".fullwidth-slideshow-pager").data("owlCarousel") !== undefined) {
        center(current)
      }
    }

    $(".fullwidth-slideshow-pager").on("click", ".owl-item", function(e){
      e.preventDefault();
      const number = $(this).data("owlItem");
      sync1.trigger("owl.goTo", number);
    });

    function center(number){
      const sync2visible = sync2.data("owlCarousel").owl.visibleItems;
      let num = number;
      let found = false;
      for (let i in sync2visible) {
        if (num === sync2visible[i]) {
          found = true;
        }
      }
      if (found === false) {
        if (num > sync2visible[sync2visible.length - 1]) {
          sync2.trigger("owl.goTo", num - sync2visible.length + 2)
        }
        else {
          if (num - 1 === -1) {
            num = 0;
          }
          sync2.trigger("owl.goTo", num);
        }
      }
      else
        if (num === sync2visible[sync2visible.length - 1]) {
          sync2.trigger("owl.goTo", sync2visible[1])
        }
      else
        if (num === sync2visible[0]) {
          sync2.trigger("owl.goTo", num - 1)
        }
    }

    let owl = $(".fullwidth-slideshow").data("owlCarousel");

    $(document.documentElement).keyup(function(event){
      // handle cursor keys
      if (event.keyCode == 37) {
        owl.prev();
      }
      else
        if (event.keyCode == 39) {
          owl.next();
        }
    });

    if ($(".owl-carousel").length) {
      owl = $(".owl-carousel").data('owlCarousel');
      owl.reinit();
    }

  })(jQuery);
};


/* ---------------------------------------------
 Portfolio section
 --------------------------------------------- */

// Projects filtering
let fselector = 0;
const work_grid = $("#work-grid, #isotope");

function initWorkFilter(){
  (function($){
    "use strict";
    let isotope_mode;
    if (work_grid.hasClass("masonry")){
      isotope_mode = "masonry";
    } else{
      isotope_mode = "fitRows"
    }

    $(".filter").click(function(){
      $(".filter").removeClass("active");
      $(this).addClass("active");
      fselector = $(this).attr('data-filter');

      work_grid.isotope({
        itemSelector: '.mix',
        layoutMode: isotope_mode,
        filter: fselector
      });
      return false;
    });

    if (window.location.hash) {
      $(".filter").each(function(){
        if ($(this).attr("data-filter") == "." + window.location.hash.replace("#", "")) {
          $(this).trigger('click');

          $("html, body").animate({
            scrollTop: $("#portfolio").offset().top
          });

        }
      });
    }

    work_grid.imagesLoaded(function(){
      work_grid.isotope({
        itemSelector: '.mix',
        layoutMode: isotope_mode,
        filter: fselector
      });
    });


  })(jQuery);
}


/* ---------------------------------------------
 Height 100%
 --------------------------------------------- */
function js_height_init(){
  (function($){
    $(".js-height-full").height($(window).height());
    $(".js-height-parent").each(function(){
      $(this).height($(this).parent().first().height());
    });
  })(jQuery);
}


/* ---------------------------------------------
 WOW animations
 --------------------------------------------- */

function init_wow(){
  (function($){

    const wow = new WOW({
      boxClass: 'wow',
      animateClass: 'animated',
      offset: 90,
      mobile: false,
      live: true
    });

    wow.init();

  })(jQuery);
}


/* ---------------------------------------------
 Masonry
 --------------------------------------------- */

function init_masonry(){
  (function($){

    $(".masonry").imagesLoaded(function(){
      $(".masonry").masonry();
    });

  })(jQuery);
}
