# Chrome Web Store listing

Copy-paste material for the Developer Dashboard. Keep this file in sync with
what is actually submitted.

## Basic info

| Field | Value |
| --- | --- |
| Name | Open in Browser for Slack |
| Category | Workflow & Planning (仕事効率化) |
| Language | English (add Japanese as a second locale if desired) |
| Homepage | https://github.com/monzou/slack-open-browser |
| Privacy policy URL | https://github.com/monzou/slack-open-browser/blob/main/PRIVACY.md |

## Summary (max 132 chars)

**EN**

> Opens Slack message links in the Slack web client instead of the desktop app, and highlights the linked message.

**JA**

> Slack のメッセージリンクをデスクトップアプリではなくブラウザの Slack で開き、該当メッセージをハイライトします。

## Detailed description

**EN**

> Tired of Slack message links kicking you out of your browser and into the
> desktop app?
>
> When you open a Slack message link, Slack shows a "Launching Slack…" page
> and tries to open the desktop app. This extension clicks Slack's own "use
> Slack in your browser" link for you, so the message opens right in the web
> client — and because it uses Slack's own escape hatch, Slack remembers the
> choice for the rest of the day.
>
> As a bonus, once the web client opens, the linked message is briefly
> highlighted so you can spot it instantly in a busy channel.
>
> FEATURES
> • Auto-skips the "Launching Slack…" interstitial for message links
> • Temporarily highlights the linked message in the web client
> • No configuration, no popup, no toolbar button — it just works
> • No data collection, no analytics, no network requests (see privacy policy)
> • Open source: https://github.com/monzou/slack-open-browser
>
> NOTES
> • Depending on timing, the OS "Open Slack.app?" dialog may still flash once;
>   the page itself stays in the browser
> • The highlight works when the link opens as a new page load (the normal
>   case for links clicked outside Slack)
>
> This is an unofficial extension and is not affiliated with, endorsed by, or
> sponsored by Slack Technologies, LLC or Salesforce, Inc.

**JA**

> Slack のメッセージリンクを開くたびに「Slack を起動しています…」の画面から
> デスクトップアプリに飛ばされていませんか？
>
> この拡張機能は、Slack 自身が用意している「ブラウザで開く」リンクを自動で
> クリックし、メッセージをそのまま Web 版 Slack で開きます。Slack 純正の
> 導線を使うため、その日の以降のリンクはインタースティシャルなしで直接
> ブラウザで開くようになります。
>
> さらに、Web 版が開いたあとリンク先のメッセージを数秒間ハイライトするので、
> 流れの速いチャンネルでもどのメッセージか一目で分かります。
>
> 特徴
> • メッセージリンクの「Launching Slack…」画面を自動でスキップ
> • リンク先メッセージを一時的にハイライト
> • 設定・ポップアップ・ツールバーボタン一切なし
> • データ収集・アナリティクス・外部通信なし（プライバシーポリシー参照）
> • オープンソース: https://github.com/monzou/slack-open-browser
>
> 注意
> • タイミングによっては OS の「Slack.app を開きますか？」ダイアログが一瞬
>   表示されることがあります（ページ自体はブラウザに留まります）
> • ハイライトはリンクが新規ページ読み込みとして開いた場合に動作します
>   （ブラウザ外からリンクをクリックした通常のケース）
>
> 本拡張は非公式であり、Slack Technologies, LLC および Salesforce, Inc. とは
> 一切関係ありません。

## Privacy practices tab

**Single purpose description**

> Open Slack message links in the Slack web client in the browser (instead of
> the Slack desktop app), and temporarily highlight the linked message.

**Host permission justification** (`https://*.slack.com/archives/*`)

> Slack shows its "Launching Slack…" interstitial for message links on the
> workspace's own subdomain (e.g. myworkspace.slack.com/archives/...). The
> content script must run there to click Slack's own "use Slack in your
> browser" link. The wildcard is required because every Slack workspace has
> its own subdomain. The script runs only on /archives/* paths (message
> links), not on other Slack pages.

**Host permission justification** (`https://app.slack.com/client/*`)

> After the interstitial redirects to the Slack web client, a second content
> script reads the message timestamp from the page URL and temporarily
> highlights the linked message so the user can find it. It does nothing on
> ordinary Slack sessions (it exits immediately when the URL carries no
> message timestamp).

**Data usage**

- Does NOT collect any data: check "No" / leave all data categories unchecked
- No remote code is used

## Assets

| Asset | File | Status |
| --- | --- | --- |
| Icon 128×128 | `icons/icon128.png` | ready |
| Screenshot 1280×800 | `assets/screenshot-1280x800.png` | ready |
| Small promo tile 440×280 (optional) | — | not made |
| Marquee 1400×560 (optional) | — | not made |

## Submission checklist

1. Zip: `manifest.json`, `content.js`, `highlight.js`, `highlight.css`, `icons/*.png` at the archive root
2. Upload zip → fill Store listing tab (name / summary / description / category / screenshots)
3. Privacy practices tab → paste the justifications above, declare no data collection
4. Distribution: choose Public or Unlisted
5. Submit for review (typically 1–3 days for a no-permissions MV3 extension)
