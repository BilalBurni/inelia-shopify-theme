/* ============================================================
   INELIA RECORDS — theme scripts
   1. Transparent-over-hero header that becomes a solid ivory
      sticky bar on scroll.
   2. Subtle reveal-on-scroll animations.
   3. "Find Your Sound" two-step discovery assistant.
   Idempotent: safe to include more than once.
   ============================================================ */
(function () {
  'use strict';

  if (window.ineliaInitDone) return;
  window.ineliaInitDone = true;

  function init() {
    /* ---------- 1. Header transparency ---------- */
    var main = document.getElementById('MainContent');
    var firstSection = main ? main.querySelector('.shopify-section:first-child') : null;
    var hasFullHero = !!(firstSection && firstSection.querySelector('.inelia-hero--full, .inelia-hero--large'));

    if (hasFullHero) {
      document.body.classList.add('inelia-has-hero');
      var onScroll = function () {
        document.body.classList.toggle('inelia-scrolled', window.scrollY > 24);
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    /* ---------- 2. Reveal on scroll ---------- */
    var reveals = document.querySelectorAll('.inelia-reveal');
    if (reveals.length && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) {
              e.target.classList.add('inelia-in');
              io.unobserve(e.target);
            }
          });
        },
        { threshold: 0.12 }
      );
      reveals.forEach(function (el) { io.observe(el); });
    } else {
      reveals.forEach(function (el) { el.classList.add('inelia-in'); });
    }

    /* ---------- 3. Find Your Sound ---------- */
    document.querySelectorAll('[data-inelia-fys]').forEach(setupFys);
  }

  function setupFys(root) {
    var stepActivity = root.querySelector('[data-fys-step="activity"]');
    var stepMood = root.querySelector('[data-fys-step="mood"]');
    var stepResult = root.querySelector('[data-fys-step="result"]');
    if (!stepActivity || !stepMood || !stepResult) return;

    var results = {};
    var fallback = null;
    try {
      var dataEl = root.querySelector('[data-fys-results]');
      if (dataEl) {
        var parsed = JSON.parse(dataEl.textContent);
        results = parsed.results || {};
        fallback = parsed.fallback || null;
      }
    } catch (e) {
      /* leave results empty; fallback handles it */
    }

    var chosenActivity = null;
    var chosenMood = null;

    function activate(step) {
      [stepActivity, stepMood, stepResult].forEach(function (s) {
        s.classList.remove('inelia-active');
      });
      step.classList.add('inelia-active');
    }

    function bindTiles(step, isActivity) {
      step.querySelectorAll('.inelia-fys__tile').forEach(function (tile) {
        tile.addEventListener('click', function () {
          step.querySelectorAll('.inelia-fys__tile').forEach(function (t) {
            t.classList.remove('inelia-selected');
          });
          tile.classList.add('inelia-selected');
          if (isActivity) {
            chosenActivity = tile.dataset.val;
          } else {
            chosenMood = tile.dataset.val;
          }
          setTimeout(function () {
            if (isActivity) {
              activate(stepMood);
            } else {
              showResult();
            }
          }, 380);
        });
      });
    }

    function showResult() {
      var key = chosenActivity + '|' + chosenMood;
      var data = results[key] || fallback;
      if (!data) return;
      var tag = stepResult.querySelector('[data-fys-tag]');
      var title = stepResult.querySelector('[data-fys-title]');
      var desc = stepResult.querySelector('[data-fys-desc]');
      var cta = stepResult.querySelector('[data-fys-cta]');
      if (tag) tag.textContent = 'For ' + chosenActivity + ' + ' + chosenMood;
      if (title) title.textContent = data.title;
      if (desc) desc.textContent = data.description;
      if (cta && data.url) cta.setAttribute('href', data.url);
      activate(stepResult);
    }

    bindTiles(stepActivity, true);
    bindTiles(stepMood, false);

    var restart = root.querySelector('[data-fys-restart]');
    if (restart) {
      restart.addEventListener('click', function () {
        chosenActivity = null;
        chosenMood = null;
        root.querySelectorAll('.inelia-fys__tile').forEach(function (t) {
          t.classList.remove('inelia-selected');
        });
        activate(stepActivity);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
