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
