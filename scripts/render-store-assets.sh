#!/usr/bin/env bash
# Render the Chrome Web Store screenshots and promo tiles from
# assets/store/src/store.html with headless Chrome.
set -euo pipefail

cd "$(dirname "$0")/.."

CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
SRC="file://$PWD/assets/store/src/store.html"
OUT="assets/store"

# render <screen> <lang> <width> <height> <scale> <output>
render() {
  local screen=$1 lang=$2 width=$3 height=$4 scale=$5 output=$6
  mkdir -p "$(dirname "$output")"
  "$CHROME" --headless --disable-gpu --hide-scrollbars \
    --force-device-scale-factor="$scale" \
    --window-size="$width,$height" \
    --screenshot="$PWD/$output" \
    "$SRC?screen=$screen&lang=$lang" >/dev/null 2>&1
  echo "$output"
}

for lang in en ja; do
  render hero      "$lang" 1280 800 1 "$OUT/$lang/screenshot-1.png"
  render highlight "$lang" 1280 800 1 "$OUT/$lang/screenshot-2.png"
  render trust     "$lang" 1280 800 1 "$OUT/$lang/screenshot-3.png"
  render tile      "$lang" 440  280 1 "$OUT/$lang/promo-small-440x280.png"
done

# @2x hero for the README, where 1280px looks soft on HiDPI screens.
render hero en 1280 800 2 "$OUT/en/screenshot-1@2x.png"
