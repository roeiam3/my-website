(function () {
  var KEY = 'theme';
  var root = document.documentElement;

  function isLight() {
    return root.getAttribute('data-theme') === 'light';
  }

  function apply(theme) {
    if (theme === 'light') root.setAttribute('data-theme', 'light');
    else root.removeAttribute('data-theme');

    var btn = document.getElementById('theme-toggle');
    if (!btn) return;
    var light = theme === 'light';
    btn.setAttribute('aria-pressed', light ? 'true' : 'false');
    btn.setAttribute('aria-label', light ? 'Switch to dark mode' : 'Switch to light mode');
  }

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;

    apply(isLight() ? 'light' : 'dark');

    btn.addEventListener('click', function () {
      var next = isLight() ? 'dark' : 'light';
      try {
        localStorage.setItem(KEY, next);
      } catch (e) {}
      apply(next);
    });
  });
})();
