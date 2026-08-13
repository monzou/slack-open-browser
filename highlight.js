// After the interstitial's "open in browser" link redirects a message link to
// the web client (app.slack.com/client/...), the client scrolls to the target
// message but gives little visual indication of which one it is. This script
// re-derives the target message timestamp from the URL and applies a
// temporary fading highlight (see highlight.css) so the message is easy to
// spot. Holding the timestamp also lets it recover when the client boots
// without ever loading the message — see RETRY_GRACE_MS below.

// The timestamp is captured at document_start because the client is an SPA
// that rewrites the URL once it boots. Message links carry it either as an
// archives-style /p<10 digits><6 digits> path segment or as a bare
// <10 digits>.<6 digits> segment. When thread_ts is also present in the query,
// the path segment is still the actual target (thread_ts is the parent).
const deriveTargetTs = () => {
  const pMatch = location.pathname.match(/\/p(\d{10})(\d{6})(?:\/|$)/);
  if (pMatch) {
    return `${pMatch[1]}.${pMatch[2]}`;
  }
  const bareMatch = location.pathname.match(/\/(\d{10}\.\d{6})(?:\/|$)/);
  return bareMatch ? bareMatch[1] : null;
};

// The client sometimes finishes booting into the channel without ever loading
// the linked message: on Enterprise Grid the URL is rewritten from the
// workspace id to the org id while the client boots, and if routing has not
// consumed the deep link by the time the URL is normalised, the timestamp is
// simply dropped and the message is never fetched. Slack has no way back at
// that point — the timestamp is gone from the URL — but we still hold it, so
// load the timestamped URL once more. The retry is warm (boot data is cached)
// and starts from the org-form URL, skipping the redirect the first attempt
// raced with. This is exactly what a user does by hand today: click the link
// again, and it works.
const RETRY_FLAG_PREFIX = "slack-open-browser-retried:";

// How long after the client settles (the timestamp disappearing from the URL,
// meaning routing has committed) to keep waiting for the message before
// concluding it will never render. Comfortably above the observed healthy case
// — the message renders within a second or so of the URL settling — because a
// needless retry costs a full reload.
const RETRY_GRACE_MS = 6000;

// The URL is rewritten during boot with no event to hook, so poll it.
const URL_POLL_MS = 200;

const HIGHLIGHT_CLASS = "slack-open-browser-highlight";

// How long the highlight animation runs. Must stay in sync with the animation
// duration in highlight.css. Observation continues exactly until the fade
// completes, so nodes that lose the class mid-fade can be re-tagged — and
// never after, when re-tagging would flash an already-faded message again.
const FADE_MS = 6000;

// The web client is heavy and the target message may render late, so this
// give-up window is much longer than the interstitial script's.
const OBSERVE_TIMEOUT_MS = 30000;

// The client mutates the DOM constantly while booting and scrolling, so
// instead of scanning per mutation batch, coalesce to at most one document
// scan per this interval. Scanning the whole document (rather than only the
// nodes a mutation touched) is deliberate: the virtual list builds items
// incrementally, so the timestamp attribute is not necessarily present at the
// moment its node is inserted.
const SCAN_COALESCE_MS = 100;

const ts = deriveTargetTs();
if (ts) {
  // The message list item carries the timestamp in data-item-key / id; in
  // thread panes the value can be prefixed with the channel id, so match by
  // suffix.
  const selector = `[data-item-key$="${ts}"], [id$="${ts}"]`;

  let firstHitAt = null;

  // Tag every match that isn't tagged yet. A node tagged after the first hit
  // — the virtual list recycled the row, or Slack rewrote the row's className
  // and stripped our class — gets the elapsed time as a negative offset (read
  // by highlight.css as animation-delay), so the fade resumes where it left
  // off instead of restarting at full intensity. Already-tagged nodes are
  // left alone: changing the offset on a running animation makes it jump.
  const applyHighlight = () => {
    const items = document.querySelectorAll(selector);
    if (items.length === 0) {
      return false;
    }
    firstHitAt ??= Date.now();
    const elapsedMs = Date.now() - firstHitAt;
    for (const el of items) {
      if (!el.classList.contains(HIGHLIGHT_CLASS)) {
        el.style.setProperty("--slack-open-browser-elapsed", `-${elapsedMs}ms`);
        el.classList.add(HIGHLIGHT_CLASS);
      }
    }
    return true;
  };

  let scanId = null;
  let found = false;

  const compactTs = ts.replace(".", "");
  const urlHasTs = () =>
    location.href.includes(ts) || location.href.includes(compactTs);

  // The last URL still carrying the timestamp — what the retry loads. It is
  // tracked rather than fixed at the initial URL so the retry starts from the
  // org-form URL once the client has rewritten it.
  let lastTimestampedUrl = location.href;
  let retryId = null;

  // A retry must not yank the page out from under someone who has already
  // started using it — a half-typed message would go with it. Watched in the
  // capture phase because Slack stops propagation on much of its own input
  // handling, and torn down in stop(): `once` only unregisters a listener that
  // fires, and these are meant to outlive nothing but the retry window.
  const USER_ACTIVITY_EVENTS = ["keydown", "pointerdown"];
  let userActive = false;
  const noteUserActive = () => {
    userActive = true;
  };
  for (const type of USER_ACTIVITY_EVENTS) {
    addEventListener(type, noteUserActive, { once: true, capture: true });
  }

  const retryOnce = () => {
    // Checked against the DOM rather than `found` alone: scans are coalesced,
    // so the message can be on screen a beat before a scan has recorded it.
    if (found || userActive || document.querySelector(selector)) {
      return;
    }
    // Flagged per tab (and per message), so the retry can never loop while a
    // second tab opened on the same message still gets its own attempt.
    const flagKey = `${RETRY_FLAG_PREFIX}${ts}`;
    if (sessionStorage.getItem(flagKey)) {
      return;
    }
    sessionStorage.setItem(flagKey, "1");
    location.replace(lastTimestampedUrl);
  };

  const cancelRetry = () => {
    clearInterval(settleWatchId);
    clearTimeout(retryId);
    for (const type of USER_ACTIVITY_EVENTS) {
      removeEventListener(type, noteUserActive, { capture: true });
    }
  };

  // The timestamp disappearing from the URL means the client has committed its
  // route. From there the message either renders shortly or never will.
  const settleWatchId = setInterval(() => {
    if (urlHasTs()) {
      lastTimestampedUrl = location.href;
      return;
    }
    clearInterval(settleWatchId);
    retryId = setTimeout(retryOnce, RETRY_GRACE_MS);
  }, URL_POLL_MS);

  // Single teardown path: disconnecting alone would leave a pending coalesced
  // scan, the give-up timer, or the retry to fire afterwards.
  const stop = () => {
    observer.disconnect();
    clearTimeout(scanId);
    clearTimeout(giveUpId);
    cancelRetry();
  };

  const observer = new MutationObserver(() => {
    if (scanId !== null) {
      return;
    }
    scanId = setTimeout(() => {
      scanId = null;
      if (applyHighlight() && !found) {
        found = true;
        cancelRetry();
        clearTimeout(giveUpId);
        setTimeout(stop, FADE_MS);
      }
    }, SCAN_COALESCE_MS);
  });

  // childList covers the initial render and node-replacing recycling. The
  // class attribute is also observed because Slack (React) rewrites className
  // wholesale on re-render, silently stripping our class — the next scan then
  // re-tags the row with the resume offset. Our own no-op classList.add calls
  // on already-tagged rows don't mutate the attribute, so this cannot loop.
  observer.observe(document, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["class"],
  });
  const giveUpId = setTimeout(stop, OBSERVE_TIMEOUT_MS);
}
