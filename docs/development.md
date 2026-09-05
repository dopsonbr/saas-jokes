# Development

## Local topology

- web: `http://localhost:5173`
- api: `http://localhost:3001`
- marketing: `http://localhost:5174`

Use a dedicated Neon development branch/project and Clerk development instance. Local development may represent one synthetic customer cell.

The joke collaborator defaults to `AI_PROVIDER=mock`, which exercises the authenticated TanStack AI stream with deterministic responses. For local live AI, set `AI_PROVIDER=vercel-gateway` and add a server-only `AI_GATEWAY_API_KEY` to `apps/api/.env.local`. On Vercel, the same provider uses the automatically injected OIDC token and model `openai/gpt-5.6-luna`, so an API key does not need to be copied into the deployment. Alternatively, set `AI_PROVIDER=openai` and inject a server-only `OPENAI_API_KEY` to call `gpt-5.6-luna` directly.

## Commands

```bash
pnpm dev
pnpm typecheck
pnpm lint
pnpm build
pnpm e2e:api
pnpm e2e:web
```

Database:

```bash
pnpm --filter @punchline-hq/db db:generate
pnpm --filter @punchline-hq/db db:migrate
pnpm --filter @punchline-hq/db db:seed
```

## Adding a feature

1. Add/adjust DTO schemas in `packages/contracts`.
2. Implement API behavior in `apps/api`.
3. Add a browser call in `packages/api-client`.
4. Consume it from a TanStack Query hook/page in `apps/web`.
5. Reuse primitives from `packages/ui`; add a new shared primitive there only when it is generic.
6. Add a DB migration only if storage changes.
7. Verify loading, empty, error, and populated states.

This order keeps the HTTP contract explicit.

## E2E

Use the Playwright suite in `tests/e2e` for real browser/API verification. It starts the local API and SPA and uses a synthetic Clerk organization/user plus a dedicated Neon test database. See `docs/testing.md` for setup. E2E is intentionally local/pre-release; this starter does not require CI.


## Adding shadcn components

Run from the repository root:

```bash
pnpm dlx shadcn@latest add dialog -c apps/web
```

The monorepo `components.json` files route shared UI primitives into `packages/ui`. Keep feature-specific composed components in `apps/web`.
