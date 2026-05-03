# Tilt

Mobile-first trading journal PWA. Emotion tracker + heavy analytics + Claude AI coach.

## Stack

- React 19 + Vite 6 (PWA via vite-plugin-pwa)
- Supabase (Postgres + Auth + Edge Functions + RLS + pg_cron)
- recharts, framer-motion, lucide-react, react-hook-form + zod, Zustand
- AI: Claude Haiku 4.5 in Deno Edge Functions, prompt-cached
- Stripe Checkout (Pro $12/mo)

## Run

```bash
cp .env.example .env   # fill in Supabase URL + anon key
npm install
npm run dev            # http://localhost:5176
```

## Layout

- `src/pages/` — route components
- `src/components/nav/` — bottom tab bar (icon-only, 5 slots)
- `src/lib/analytics.js` — pure math (ported from `apps/trade-journal`)
- `supabase/migrations/` — schema + RLS
- `supabase/functions/` — Edge Functions (AI, Stripe, push)

## Plan

See `C:\Users\clari\.claude\plans\i-want-to-create-adaptive-wilkinson.md` for the full design.
