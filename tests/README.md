# Tests

Automated test suite for ChicFlecto.

## Layout

- `tests/unit/` — Vitest + Testing Library specs (jsdom). Cover the subscription
  and payment services, the `useSubscription` hook, the `cn` helper, the
  `ProtectedRoute` auth gate, and the 404 page. Supabase and network calls are
  mocked, so these run fully offline.
- `tests/e2e/` — Playwright smoke tests that drive the production build
  (`vite preview`): the home page renders, protected routes redirect
  unauthenticated visitors to `/auth`, and unknown routes render the 404 page.
- `tests/setup.ts` — global test setup (jest-dom matchers, `matchMedia` stub,
  per-test cleanup).

## Commands

```bash
npm test          # run unit tests once
npm run test:watch # unit tests in watch mode
npm run test:e2e  # build first (npm run build), then Playwright smoke tests
```

The e2e suite starts `vite preview` on port 6995 automatically. Run
`npm run build` beforehand so the preview server has a fresh `dist/`.

CI (`.github/workflows/ci.yml`) runs the build + unit tests and the Playwright
smoke tests on every push and pull request.
