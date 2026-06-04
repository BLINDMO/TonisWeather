# Toni's Weather 🌤️🦒

A gentle, PMDD-aware menstrual & hormone tracker where **the weather is a metaphor
for how you'll feel**. Built as an installable, mobile-first web app (PWA) for iOS
Safari and Android — curated just for Toni.

> Supportive tool, not medical advice.

## What it does

- **Weather home screen** — a beautiful animated forecast of today's outlook, driven
  by where you are in your cycle and what you've logged. Sunny days, rainy days, and
  the dreaded **tornado days**.
- **Hormone chart & plain-language summary** — a smooth visualization of estrogen,
  progesterone, LH, FSH and testosterone across your cycle, plus an explanation of
  *what* they're doing to you right now and *why*.
- **3-day forecast** — exactly what Toni asked for: a quick look at how the next few
  days are likely to feel.
- **Adaptive calendar** — a month view highlighting **predicted period**,
  **ovulation**, the **fertile window**, **tornado days** (late-luteal PMDD risk),
  and days your *own history* shows tend to be hard.
- **Flo-style day logging** — tap a day to pick how you feel with emoji, drag a 1–10
  mood slider, log your period & flow, and add a note.
- **Murph the giraffe** — when you save a hard day, your giraffe companion pops in with
  *practical, real-world* help: walks, sunlight, foods, vitamins, breathing and
  grounding exercises.
- **Emotion Workshop** — guided, warm writing prompts (gratitude, nostalgia, and
  reflections on the people you love — tailored to your household) to gently shift a
  tornado day.
- **Private & persistent** — all data is stored on your device and stays put even if
  you don't open the app for days. Export a backup file any time to keep it safe or
  move to a new phone.

## How the "adapting" works

The engine starts from your onboarding answers, then continuously re-learns:

1. **Real period start dates** you log refine your true cycle length + anchor
   (recent cycles weighted more heavily).
2. **Your 1–10 mood logs**, indexed by cycle day, reveal which days are historically
   hard *for you specifically* — not just the textbook average.
3. Predictions blend **textbook hormone science** (`src/lib/hormones.ts`) with **your
   personal history** (`src/lib/cycle.ts`), with a confidence score that grows as you
   log more.

The hormone model scales the classic landmarks (estrogen peak before ovulation, the
LH surge, the mid-luteal progesterone dome, and the late-luteal withdrawal that
triggers PMDD) to *your* cycle and luteal lengths.

## Tech

- React + TypeScript + Vite
- Tailwind CSS for the modern, soft "weather" design system
- Framer Motion for animation
- Zustand (+ localStorage persistence) for private, offline data
- `vite-plugin-pwa` so it installs to the home screen
- All graphics are hand-built inline SVG (weather scenes, the giraffe, hormone charts)

## Run it

```bash
npm install
npm run dev        # local dev server
npm run build      # production build → dist/
npm run preview    # preview the production build
```

## Deploy (GitHub Pages)

The app is published to the **`gh-pages`** branch and served at
**https://blindmo.github.io/TonisWeather/**.

One-time setup — enable Pages:

1. Go to the repo **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **Deploy from a branch**.
3. Branch: **`gh-pages`**, folder: **`/ (root)`** → **Save**.
4. Wait ~1 minute, then open the URL above.

To redeploy after changing the app:

```bash
bash scripts/deploy-gh-pages.sh
```

> A GitHub Actions workflow (`.github/workflows/deploy.yml`) is also included for
> environments that have hosted runners — run it from the Actions tab and set the
> Pages source to "GitHub Actions". The build environment used here had no runners,
> hence the branch-based deploy.

### Install on an iPhone

1. Open the deployed URL in **Safari**.
2. Tap the **Share** button → **Add to Home Screen**.
3. Launch it from the new icon — it runs full-screen like a native app.

## Project structure

```
src/
  lib/
    hormones.ts     # the physiological hormone model + explanations
    cycle.ts        # the adaptive prediction engine (the "brain")
    feelings.ts     # emoji feeling tags
    suggestions.ts  # Murph's coping toolkit
    workshop.ts     # Emotion Workshop prompts
    date.ts         # date helpers
    useModel.ts     # rebuilds the model from stored data
  components/       # WeatherScene, Giraffe, HormoneChart, DaySheet, GiraffeModal, ...
  pages/            # Onboarding, Home, CalendarPage, WorkshopPage, SettingsPage
  store.ts          # Zustand store + export/import backup
```
