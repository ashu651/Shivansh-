# Snapzy Web (Next.js)

## Run

```bash
pnpm install
pnpm dev
```

- App Router under `app/`
- TailwindCSS configured
- API base via `NEXT_PUBLIC_API_URL`

## Testing

```bash
pnpm test
```

## E2E (Playwright)

Initialize once: `npx playwright install`. Add tests under `apps/web/e2e` and run with `npx playwright test --project=chromium`.

## Storybook (design system demo)

App: `pnpm --filter @snapzy/web storybook` (after initializing Storybook)
Shared UI: `pnpm --filter @snapzy/ui storybook`

## Accessibility

- Keyboard focus outlines enabled on buttons
- Use alt text for all images