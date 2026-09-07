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

  // ponytail: highlight the section nearest the top of the viewport. Cheaper and
  // steadier than tracking scroll position, and it needs no rAF throttling.
  var links = menu ? Array.from(menu.querySelectorAll('a[href^="#"]')) : [];
  var sections = links
    .map(function (link) { return document.querySelector(link.getAttribute('href')); })
    .filter(Boolean);

  if (!sections.length || !('IntersectionObserver' in window)) return;

  var visible = new Map();

  function paint() {
    var current = null;
    sections.forEach(function (section) {
      if (visible.get(section)) current = current || section;
    });
    links.forEach(function (link) {
      var match = current && link.getAttribute('href') === '#' + current.id;
      if (match) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      visible.set(entry.target, entry.isIntersecting);
    });
    paint();
  }, { rootMargin: '-20% 0px -70% 0px' });

  sections.forEach(function (section) { observer.observe(section); });
})();
