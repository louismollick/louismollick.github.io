// STICKY NAV
window.onscroll = function() {stickyNav()};
let nav = document.querySelector(".nav");
let hero = document.querySelector(".hero");
let heroHeight = hero.offsetHeight;
function stickyNav() {
  if (window.pageYOffset >= heroHeight) {
    nav.classList.add("notsticky");
  } else {
    nav.classList.remove("notsticky");
  }
}

// SMOOTH SCROLL FOR IE AND SAFARI
let hero_button = document.querySelector(".hero-button");
hero_button.addEventListener('click', function(){smoothScroll('#projects', 1000)});
function smoothScroll(target, duration) {
  var target = document.querySelector(target);
  var targetPosition = target.getBoundingClientRect().top;
  var startPosition = window.pageYOffset || window.scrollY;
  var distance = targetPosition - startPosition;
  var startTime = null;

  function loop(currentTime) {
    if (startTime === null) startTime = currentTime;
    var timeElapsed = currentTime - startTime;
    var run = ease(timeElapsed, startPosition, distance, duration);
    window.scrollTo(0, run);
    if (timeElapsed < duration) requestAnimationFrame(loop);
  }
  function ease(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;

  }
  requestAnimationFrame(loop);
}


