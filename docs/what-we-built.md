# What we've built so far

Fuelmate — a concise overview for revision and context.

- Monorepo mobile app (Expo / React Native) focused on tracking fuel prices, stations, and alerts.
- App location: apps/mobile — tabbed UI (alerts, prices, tracker, group), auth flows, and modalus (add-alert, invite, station, log-fill).
- State & logic: packages/store contains `alertsStore`, `authStore`, `groupStore`, `trackerStore` (with tests).
- Shared utilities: packages/lib and top-level lib/ provide `supabase` integration, `notifications`, and `toast` helpers.
- UI: packages/ui exposes reusable components (Button, Badge, Card, Input, LedDisplay, MoneyText, ScreenHeader, ThemeToggle) used by the app.
- Data & assets: mock station data, fonts, and images under apps/mobile/assets.
- Backend: supabase/migrations includes SQL migrations for initial schema and profiles push token.
- Tooling: PNPM + Turbo monorepo, Expo/EAS config, Tailwind, Jest tests across packages and app.

Use this file as a short context summary when asking for revisions or prompt updates.
