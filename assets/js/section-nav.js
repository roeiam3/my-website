(function () {
  var HEADING_SELECTOR = '.content h2';

  document.addEventListener('DOMContentLoaded', function () {
    var nav = document.querySelector('.content-section-nav');
    var list = document.querySelector('.content-section-nav__list');
    if (!nav || !list) return;

    var headings = Array.prototype.slice.call(document.querySelectorAll(HEADING_SELECTOR));
    if (headings.length < 2) {
      nav.remove();
      return;
    }

    var dots = headings.map(function (heading, index) {
      if (!heading.id) heading.id = 'section-' + (index + 1);

      var item = document.createElement('li');
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'content-section-nav__dot';
      dot.setAttribute('data-label', heading.textContent.trim());
      dot.setAttribute('aria-label', 'Jump to ' + heading.textContent.trim());
      dot.addEventListener('click', function () {
        heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });

      item.appendChild(dot);
      list.appendChild(item);
      return dot;
    });

    var ticking = false;

    function updateActive() {
      var line = window.innerHeight * 0.3;
      var activeIndex = 0;

      headings.forEach(function (heading, index) {
        if (heading.getBoundingClientRect().top <= line) activeIndex = index;
      });

      dots.forEach(function (dot, index) {
        dot.classList.toggle('is-active', index === activeIndex);
      });

      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(updateActive);
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    updateActive();
  });
})();
