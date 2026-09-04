#!/bin/bash
# Double-click me to run NOODLES on this laptop — no internet needed.
# It builds once (if needed), serves the game locally and opens your browser.
cd "$(dirname "$0")"

if ! command -v npm >/dev/null 2>&1; then
  echo "Node.js/npm not found. Install Node from https://nodejs.org and try again."
  read -n 1 -s -r -p "Press any key to close."
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "First run — installing dependencies (one time, needs internet)…"
  npm install
fi

if [ ! -f dist/index.html ] || [ -n "$(find src public roster.local.txt vite.config.js -newer dist/index.html 2>/dev/null | head -1)" ]; then
  echo "Building NOODLES…"
  npm run build
fi

echo
echo "  NOODLES is running. Your browser should open automatically."
echo "  If not, open:  http://localhost:4173"
echo "  Press H in the game to hide the controls for the audience."
echo "  Leave this window open while presenting; close it to stop."
echo
npx vite preview --port 4173 --strictPort --open
