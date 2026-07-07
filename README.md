# Slack Open in Browser

A Chrome extension that opens Slack message links (`https://xxx.slack.com/archives/...`) in the Slack web client in your browser, instead of launching the Slack desktop app. It also works on Chromium-based browsers such as Dia.

## Background

Slack currently handles message links with the following flow:

1. `xxx.slack.com/archives/...` → Slack shows a "Launching &lt;workspace&gt;" interstitial (`data-qa="ssb_redirect_loading_page"`) **on the workspace domain itself** and fires a `slack://` deep link to launch the desktop app.
2. That interstitial offers an "open this link in your browser" escape link, which carries a `skip_today` query param. Clicking it opens the message in `app.slack.com/client/...` and tells Slack to skip the interstitial for the rest of the day.

Existing similar extensions (e.g. "Open Slack in Browser, not App") inject their content script into `*.slack.com/archives/*` but look for a link on `app.slack.com`, so they never run against the interstitial as it is actually rendered today. This extension injects into `https://*.slack.com/archives/*` — the message-link paths where the interstitial actually renders. That covers every workspace subdomain (e.g. `uzabase.slack.com`) without also running on the heavy web client (`app.slack.com/client`) or on service subdomains such as `files.slack.com` and `api.slack.com`.

## How it works

The extension watches for the "open this link in your browser" link with a MutationObserver (and also checks once on load, since the interstitial is server-rendered and the link may already be present) and clicks it as soon as it appears.

The link has no stable `data-qa` of its own, so it is matched by its `skip_today` query param, scoped to the interstitial container (`[data-qa="ssb_redirect_loading_page"]`) so a stray link elsewhere in the web client is never clicked.

Clicking the link (rather than navigating to its href) lets Slack persist the "open in browser today" state (`skip_today`), so subsequent links on the same day open directly in the browser without the interstitial.

## Installation

1. Open the extension management page
   - Chrome: `chrome://extensions`
   - Dia: open Extensions from the menu (equivalent to `chrome://extensions`)
2. Enable "Developer mode"
3. Click "Load unpacked" and select this folder

After editing the extension (or pulling an update), click the reload icon on its card so the new `manifest.json` and `content.js` take effect.

If the "Open Slack in Browser, not App" extension is installed, disable it. It never runs on the current message-link flow, but it still injects into other `*.slack.com/archives/*` pages, where it can navigate away or show its failure alert unexpectedly.

## Verifying it works

While Slack's `skip_today` state is active (after choosing "use browser" once that day), the interstitial itself is not shown and links open directly in the browser. To verify the auto-click, test after the state expires — e.g. on the first link click the next day. If the interstitial flashes briefly and you are then taken to the message automatically, it is working.

## Limitations

- Depending on the timing of the `slack://` deep link versus the auto-click, the OS-level "Open Slack.app?" dialog may still appear (the browser navigation itself completes behind the dialog)
- If Slack changes the interstitial DOM (the container `data-qa` or the `skip_today` param), the selector will need to be updated
- The extension watches for the link for 15 seconds per page load; if the interstitial renders later than that (e.g. on a very slow connection), it is not clicked
