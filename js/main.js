// Two things: the mobile nav button, and which nav link is highlighted.
// Smooth scrolling is `scroll-behavior` in CSS, so it is not here.

(function () {
  'use strict';

  var nav = document.querySelector('.nav');
  var toggle = nav && nav.querySelector('.nav__toggle');
  var menu = document.getElementById('nav-menu');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = nav.getAttribute('data-open') === 'true';
      nav.setAttribute('data-open', String(!open));
      toggle.setAttribute('aria-expanded', String(!open));
    });

    // A tap on a link has done its job; leave the menu closed behind it.
    menu.addEventListener('click', function (event) {
      if (event.target.closest('a')) {
        nav.setAttribute('data-open', 'false');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  var links = menu ? Array.prototype.slice.call(menu.querySelectorAll('a[href^="#"]')) : [];
  var sections = links
    .map(function (link) { return document.querySelector(link.getAttribute('href')); })
    .filter(Boolean);

  if (!sections.length) return;

  // The trigger line sits just below the sticky header. The current section is the
  // last one whose top has crossed it — which is why this is geometry rather than
  // an IntersectionObserver band: the last section on the page can never reach the
  // middle of the viewport, because the page runs out of scroll first.
  var TRIGGER = 96;

  function paint() {
    var current = null;

    sections.forEach(function (section) {
      if (section.getBoundingClientRect().top <= TRIGGER) current = section;
    });

    // At the bottom of the page the final section is the one being read, whatever
    // its top edge says.
    var bottom = window.innerHeight + window.pageYOffset >=
      document.documentElement.scrollHeight - 2;
    if (bottom) current = sections[sections.length - 1];

    links.forEach(function (link) {
      if (current && link.getAttribute('href') === '#' + current.id) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  window.addEventListener('scroll', paint, { passive: true });
  window.addEventListener('resize', paint, { passive: true });
  paint();
})();
