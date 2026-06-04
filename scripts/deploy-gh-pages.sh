#!/usr/bin/env bash
# Build Toni's Weather and publish it to the `gh-pages` branch for GitHub Pages.
#
# GitHub Pages serves this repo at https://blindmo.github.io/TonisWeather/, so the
# app is built with that base path. Re-run this any time you change the app.
#
# Usage:  bash scripts/deploy-gh-pages.sh
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

echo "▶ Building production site (base=/TonisWeather/)…"
VITE_BASE=/TonisWeather/ npm run build
touch dist/.nojekyll

WT=/tmp/tonis-ghpages-wt
git worktree remove "$WT" --force 2>/dev/null || true
rm -rf "$WT"

echo "▶ Preparing gh-pages worktree…"
# Reset gh-pages to a clean orphan each time to keep the branch small.
git worktree add --orphan -b gh-pages-tmp "$WT"
cp -r dist/. "$WT"/
(
  cd "$WT"
  git add -A
  git commit -q -m "Deploy Toni's Weather $(date -u +%Y-%m-%dT%H:%MZ)"
)

echo "▶ Pushing to origin/gh-pages…"
git -C "$WT" push -f origin gh-pages-tmp:gh-pages

git worktree remove "$WT" --force
git branch -D gh-pages-tmp 2>/dev/null || true

echo "✅ Deployed. Live (after ~1 min) at: https://blindmo.github.io/TonisWeather/"
