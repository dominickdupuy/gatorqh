# Gator Quant Hacks

## Event Dates
**October 2–4, 2026** (Friday–Sunday)

- Day 1: Friday, October 2 — check-in 5:00 PM, hacking begins 6:45 PM
- Day 2: Saturday, October 3
- Day 3: Sunday, October 4 — hacking ends 1:00 PM, winners announced 3:35 PM

When updating dates anywhere in the codebase, check ALL of these files:
- `src/app/components/FooterCTA.tsx` — countdown `targetDate` + heading text
- `src/app/components/Hero.tsx` — hero section date display
- `src/app/components/Schedule.tsx` — per-day schedule entries
- `src/components/HeroSection.tsx` — legacy hero component
- `src/components/ScheduleSection.tsx` — legacy schedule component

## Deployment
Vercel — deploys automatically on push to `main`.

Env vars live in the Vercel project settings, not in the repo. Vite inlines
them at build time, so changing one requires a redeploy **without** the build
cache; saving the variable alone changes nothing.

## Application form (`/apply`)

`src/app/components/ApplicationForm.tsx` posts to a Google Apps Script web app,
which appends a row to the responses sheet and saves the resume to Drive.

- Webhook URL: `VITE_INTEREST_FORM_WEBHOOK_URL` (name kept from the older
  interest form)
- Script source: `apps-script/Code.gs` — version-controlled here, but **must be
  pasted into the Apps Script editor and redeployed by hand**. Pushing to git
  does not deploy it.
- `/interest-form` and the `/intrest-form` typo alias still resolve to `/apply`;
  those links are already in circulation, so don't drop them.

If submissions stop arriving, create a **new** Apps Script deployment rather
than editing the existing one's access settings — see `apps-script/README.md`.
An unauthenticated `curl` of the `/exec` URL should return JSON; Google's "You
need access" page means the deployment is not public.
