# Testing Guide for FuelMate

This monorepo is configured with Jest for comprehensive testing across all packages and apps.

## Setup

Testing dependencies are already configured. Run:

```bash
pnpm install
```

## Running Tests

### Run all tests in the monorepo:
```bash
pnpm test
```

### Run tests in watch mode (re-run on file changes):
```bash
pnpm test:watch
```

### Run tests for a specific package:
```bash
cd packages/lib && pnpm test
cd packages/store && pnpm test
cd packages/ui && pnpm test
cd apps/mobile && pnpm test
```

## Test Structure

- **`packages/lib`** - Utility functions and helper code
  - Uses Jest with Node environment
  - Tests go in `src/**/*.test.ts` files

- **`packages/store`** - Zustand state management
  - Uses Jest with Node environment
  - Tests go in `src/**/*.test.ts` files
  - Example test in `src/authStore.test.ts`

- **`packages/ui`** - Reusable UI components
  - Uses Jest with React Testing Library
  - Tests go in `src/**/*.test.tsx` files
  - Example test in `src/components/Button.test.tsx`

- **`apps/mobile`** - Expo React Native app
  - Uses Jest with React Native Testing Library
  - Tests go in `app/**/*.test.tsx` or `components/**/*.test.tsx` files

## Writing Tests

### Example: Testing a Store (authStore)

```typescript
import { renderHook, act } from '@testing-library/react';
import { useAuthStore } from './authStore';

describe('useAuthStore', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useAuthStore());
    expect(result.current.user).toBeNull();
  });

  it('should update state on sign in', async () => {
    const { result } = renderHook(() => useAuthStore());
    await act(async () => {
      await result.current.signIn({ mock: true });
    });
    // Assert the store state changed
  });
});
```

### Example: Testing a UI Component

```typescript
import { render, screen } from '@testing-library/react-native';
import { Button } from './Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(
      <Button variant="primary" size="md" onPress={jest.fn()}>
        Click me
      </Button>
    );
    expect(screen.getByText('Click me')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByRole } = render(
      <Button variant="primary" size="md" onPress={onPress}>
        Click me
      </Button>
    );
    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalled();
  });
});
```

### Example: Testing a Utility Function

```typescript
// src/utils.test.ts
import { myUtility } from './utils';

describe('myUtility', () => {
  it('should do something', () => {
    const result = myUtility('input');
    expect(result).toBe('expected');
  });
});
```

## Test Configuration

The monorepo uses a root `jest.config.js` that references individual jest configs for each package:

- `packages/lib/jest.config.js` - Node environment for utilities
- `packages/store/jest.config.js` - Node environment for stores
- `packages/ui/jest.config.js` - Node environment for UI (can be extended for jsdom)
- `apps/mobile/jest.config.js` - Node environment for mobile app

Each config uses `ts-jest` to transpile TypeScript files.

## Next Steps

1. Add test files alongside your source code with `.test.ts` or `.test.tsx` extension
2. Run tests during development with `pnpm test:watch`
3. Run full test suite before committing with `pnpm test`
4. Aim for good coverage of business logic and critical paths

## Dev login (quick bypass for testing)

You can enable a dev login that bypasses Supabase and sets a mock user so you can test all tabs and flows locally or in preview builds.

- Locally, add to `.env.local` in the app folder or root (Expo will pick it up):

```bash
EXPO_PUBLIC_DEV_LOGIN=true
```

- Or in the browser console of a preview build, run:

```js
window.__FUELMATE_DEV_LOGIN = true;
```

When enabled, `useAuthStore.initialize()` will set a mock user and allow the app to navigate directly to the tabs and other authenticated pages. Use this for development and testing; remove or disable before production.
