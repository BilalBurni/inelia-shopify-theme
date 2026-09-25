/* ============================================================
   INELIA RECORDS — Klaviyo Free Song Funnel
   Instagram → Klaviyo signup → choose-your-free-song page →
   Klaviyo tracking → artist download page.

   Uses Klaviyo's client-side onsite queue (the same one the
   "Klaviyo: Email Marketing & SMS" app embed sets up), so no
   private API key ever touches the browser and no subscriber
   email is passed in a URL.

   "Selected Free Single" fires from the choice page just before
   redirecting to the artist's download page. "Downloaded Free
   Single" fires from the download page when the button is clicked.
   Idempotent: safe to include more than once (each section that
   needs it loads this file itself).
   ============================================================ */
(function () {
  'use strict';

  if (window.ineliaFreeSongInitDone) return;
  window.ineliaFreeSongInitDone = true;

  // Klaviyo's public queue: primed as a plain array if the app embed's
  // script hasn't finished loading yet, drained once it has. This is
  // Klaviyo's documented pattern for client-side event tracking.
  window.klaviyo = window.klaviyo || [];

  // Klaviyo's onsite script exposes two calling conventions depending on
  // version: the modern direct methods (klaviyo.track / klaviyo.identify)
  // and the legacy queue-push convention (klaviyo.push(['track', ...])).
  // Calling both when available is cheap and avoids silently dropping
  // profile updates on setups where only one convention is wired up.
  function trackEvent(name, properties) {
    try {
      if (typeof window.klaviyo.track === 'function') {
        window.klaviyo.track(name, properties);
      }
      window.klaviyo.push(['track', name, properties]);
    } catch (e) { /* tracking must never block the funnel */ }
  }

  function identify(properties) {
    try {
      if (typeof window.klaviyo.identify === 'function') {
        window.klaviyo.identify(properties);
      }
      window.klaviyo.push(['identify', properties]);
    } catch (e) { /* tracking must never block the funnel */ }
  }

  // ---------- Choice page: "Selected Free Single" ----------
  document.querySelectorAll('[data-free-song-choose]').forEach(function (card) {
    card.addEventListener('click', function () {
      var artist = card.getAttribute('data-free-song-artist') || '';
      var songTitle = card.getAttribute('data-free-song-title') || '';
      var campaign = card.getAttribute('data-free-song-campaign') || 'Instagram Free Single';
      var redirectUrl = card.getAttribute('data-free-song-redirect');

      if (!redirectUrl) return;

      trackEvent('Selected Free Single', {
        Artist: artist,
        SongTitle: songTitle,
        Campaign: campaign
      });
      identify({ 'Free Song Choice': artist });

      // Give the queued events a brief moment to reach Klaviyo before
      // the page unloads, then redirect regardless of the outcome.
      window.setTimeout(function () {
        window.location.href = redirectUrl;
      }, 350);
    });
  });

  // ---------- Download page: "Downloaded Free Single" ----------
  // Opens in a new tab (see inelia-free-song-download.liquid), so the
  // current page never unloads and there's no need to delay the click.
  document.querySelectorAll('[data-free-song-download]').forEach(function (link) {
    link.addEventListener('click', function () {
      trackEvent('Downloaded Free Single', {
        Artist: link.getAttribute('data-free-song-artist') || '',
        SongTitle: link.getAttribute('data-free-song-title') || '',
        Campaign: link.getAttribute('data-free-song-campaign') || 'Instagram Free Single'
      });
    });
  });
})();
