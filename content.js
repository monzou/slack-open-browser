// When a Slack message link is opened, Slack redirects from the workspace
// domain (server-side) to app.slack.com/client, shows an "Opening Slack..."
// interstitial there, and fires a slack:// deep link.
// This script clicks the "use Slack in your browser" link on that interstitial
// as soon as it appears, so the page stays in the browser instead of
// launching the desktop app.
//
// We use click() rather than assigning location.href so that Slack's own
// handler persists the "open in browser today" state (skip_today).
const BROWSER_LINK_SELECTOR = '[data-qa="ssb_redirect_open_in_browser"]';

// The interstitial can only appear during the initial page load, but there is
// no reliable DOM signal for "it will no longer appear", so fall back to a
// wall-clock cutoff instead of observing the mutation-heavy Slack client for
// its whole lifetime.
const OBSERVE_TIMEOUT_MS = 15000;

// Scan only the nodes each mutation adds: the Slack client boot mutates the
// DOM constantly, and re-querying the whole document on every batch would
// scale with batch count times document size.
const findBrowserLink = (records) => {
  for (const record of records) {
    for (const node of record.addedNodes) {
      if (!(node instanceof Element)) {
        continue;
      }
      if (node.matches(BROWSER_LINK_SELECTOR)) {
        return node;
      }
      const link = node.querySelector(BROWSER_LINK_SELECTOR);
      if (link) {
        return link;
      }
    }
  }
  return null;
};

let timeoutId;

const observer = new MutationObserver((records) => {
  const link = findBrowserLink(records);
  if (link) {
    observer.disconnect();
    clearTimeout(timeoutId);
    link.click();
  }
});

observer.observe(document.documentElement, { childList: true, subtree: true });
timeoutId = setTimeout(() => observer.disconnect(), OBSERVE_TIMEOUT_MS);
