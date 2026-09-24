#!/usr/bin/env bash
# Render icons/icon*.png from icons/icon.svg with headless Chrome.
set -euo pipefail

cd "$(dirname "$0")/.."

CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

# render <svg> <size>
#
# Rasterises through a window of at most 32px scaled up by the device scale
# factor: headless Chrome returns a blank screenshot for some window sizes
# (around 100-150px), but small windows render reliably.
render() {
  local svg=$1 size=$2 output="icons/icon$2.png"
  local scale=$(( size > 32 ? size / 16 : 1 ))
  local window=$(( size / scale ))
  "$CHROME" --headless --disable-gpu --hide-scrollbars \
    --default-background-color=00000000 \
    --force-device-scale-factor="$scale" \
    --window-size="$window,$window" \
    --screenshot="$PWD/$output" \
    "file://$svg" >/dev/null 2>&1
  echo "$output"
}

# The Chrome Web Store expects the 128px icon as 96x96 artwork with 16px of
# transparent padding. The master is nested inline rather than referenced via
# <image href>, which headless Chrome does not load for a top-level SVG.
{
  echo '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">'
  sed 's/<svg /<svg x="16" y="16" width="96" height="96" /' icons/icon.svg
  echo '</svg>'
} > "$TMP/icon-padded.svg"

# The small sizes stay full bleed so they remain legible in the toolbar.
render "$PWD/icons/icon.svg" 16
render "$PWD/icons/icon.svg" 32
render "$PWD/icons/icon.svg" 48
render "$TMP/icon-padded.svg" 128
