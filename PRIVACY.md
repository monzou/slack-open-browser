# Privacy Policy — Open in Browser for Slack

Last updated: 2026-07-28

## Summary

**This extension does not collect, store, or transmit any data.**

## Details

Open in Browser for Slack runs entirely on your device. It has no backend,
no analytics, and no network communication of its own.

- **No data collection.** The extension does not collect personal
  information, browsing history, message content, or usage statistics.
- **No data transmission.** The extension never sends any data anywhere. It
  performs no network requests. The only navigation that occurs is Slack's
  own "open this link in your browser" link, which the extension clicks on
  your behalf.
- **No storage.** The extension does not read or write cookies, localStorage,
  or any extension storage.
- **No remote code.** All code is contained in the extension package and is
  publicly auditable at
  https://github.com/monzou/slack-open-browser

## What the extension does on Slack pages

- On `https://*.slack.com/archives/*` (the "Launching Slack…" interstitial
  shown for message links), it clicks Slack's own "use Slack in your browser"
  link so the page stays in the browser.
- On `https://app.slack.com/client/*` (the Slack web client), it reads the
  message timestamp from the page URL and temporarily highlights the linked
  message. The timestamp is used only within the page and is discarded
  immediately.

## Contact

If you have questions about this policy, please open an issue at
https://github.com/monzou/slack-open-browser/issues
