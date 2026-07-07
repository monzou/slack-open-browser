# Slack Open in Browser

A Chrome extension that opens Slack message links (`https://xxx.slack.com/archives/...`) in the Slack web client in your browser, instead of launching the Slack desktop app. It also works on Chromium-based browsers such as Dia.

## Background

Slack currently handles message links with the following flow:

1. `xxx.slack.com/archives/...` → server-side 302 redirect (via `xxx.enterprise.slack.com/r-t...?redir=...` on Enterprise Grid)
2. The browser eventually lands on `app.slack.com/client/...`, where the "Opening Slack..." interstitial is shown and a `slack://` deep link is fired

Existing similar extensions (e.g. "Open Slack in Browser, not App") inject their content script only into `*.slack.com/archives/*`, so they never get a chance to run in the current flow, where those URLs are passed through instantly by server-side redirects. This extension targets `app.slack.com`, where the interstitial is actually rendered.

## How it works

The extension watches for the "use Slack in your browser" link (`[data-qa="ssb_redirect_open_in_browser"]`) on the `app.slack.com` interstitial with a MutationObserver and clicks it as soon as it appears. Clicking the link (rather than navigating to its href) lets Slack persist the "open in browser today" state (`skip_today`), so subsequent links on the same day open directly in the browser without the interstitial.

## Installation

1. Open the extension management page
   - Chrome: `chrome://extensions`
   - Dia: open Extensions from the menu (equivalent to `chrome://extensions`)
2. Enable "Developer mode"
3. Click "Load unpacked" and select this folder

If the "Open Slack in Browser, not App" extension is installed, disable it to avoid conflicts.

## Verifying it works

While Slack's `skip_today` state is active (after choosing "use browser" once that day), the interstitial itself is not shown. Verify the extension after the state expires — e.g. on the first link click the next day. If the interstitial flashes briefly and you are then taken to the message automatically, it is working.

## Limitations

- Depending on the timing of the `slack://` deep link versus the auto-click, the OS-level "Open Slack.app?" dialog may still appear (the browser navigation itself completes behind the dialog)
- If Slack changes the interstitial DOM (the `data-qa` attribute), the selector will need to be updated
