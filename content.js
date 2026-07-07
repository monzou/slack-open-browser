// When a Slack message link (https://<workspace>.slack.com/archives/...) is
// opened, Slack shows a "Launching <workspace>" interstitial on the workspace
// domain and fires a slack:// deep link to launch the desktop app. That
// interstitial offers an "open this link in your browser" escape link, which
// also sets skip_today so the rest of the day's links skip the interstitial.
// This script clicks that link as soon as the interstitial appears, so the
// page stays in the browser instead of launching the desktop app.
//
// We use click() rather than assigning location.href so that Slack's own
// handler runs and persists the "open in browser today" state (skip_today).
//
// The escape link has no data-qa of its own, so we match it by its skip_today
// query param, scoped to the interstitial container so we never click a stray
// link elsewhere in the web client.
const BROWSER_LINK_SELECTOR =
  '[data-qa="ssb_redirect_loading_page"] a[href*="skip_today"]';

// The interstitial only appears during the initial page load, but there is no
// reliable DOM signal for "it will no longer appear", so fall back to a
// wall-clock cutoff instead of observing the page for its whole lifetime.
const OBSERVE_TIMEOUT_MS = 15000;

// Click the interstitial's "open in browser" link if it is present, reporting
// whether it was found. Shared by the up-front check and the observer so the
// two paths can never diverge.
const clickBrowserLink = () => {
  const link = document.querySelector(BROWSER_LINK_SELECTOR);
  if (!link) {
    return false;
  }
  link.click();
  return true;
};

let timeoutId;

const observer = new MutationObserver(() => {
  if (clickBrowserLink()) {
    observer.disconnect();
    clearTimeout(timeoutId);
  }
});

// The interstitial is a small server-rendered page, so the link may already be
// present when this content script runs at document_start. Try once up front;
// otherwise watch for it to be rendered, giving up after the timeout.
if (!clickBrowserLink()) {
  observer.observe(document.documentElement, { childList: true, subtree: true });
  timeoutId = setTimeout(() => observer.disconnect(), OBSERVE_TIMEOUT_MS);
}
