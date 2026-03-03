# FuelMate Monorepo

## Setup
- Install dependencies: `pnpm install`
- Configure env: copy `.env` and set the Supabase vars
- Run mobile app: `cd apps/mobile && npx expo start`

## Environment Variables
Set these in `.env`:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## EAS Build
- iOS: `eas build --platform ios --profile production`
- Android: `eas build --platform android --profile production`

## OTA Updates
- Production channel: `eas update --channel production`

