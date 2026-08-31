# Deployment to Vercel + Neon + Clerk

## Vercel projects

From one repository, create:

For direct CLI deployments, run from the repository root and name the already-configured project so Vercel receives the full monorepo before applying its Root Directory:

```bash
vercel deploy --prod --project <project-name>
```

### Shared product project

`<product>-marketing`

- Root Directory: `apps/marketing`
- Env: `VITE_APP_URL`

### Per-customer projects

`<customer>-web`

- Root Directory: `apps/web`
- `VITE_API_URL=https://<customer-api-domain>`
- `VITE_CLERK_PUBLISHABLE_KEY=...`

`<customer>-api`

- Root Directory: `apps/api`
- `FRONTEND_URL=https://<customer-web-domain>`
- `DATABASE_URL=<customer Neon project connection string>` **Sensitive**
- `CLERK_SECRET_KEY=...` **Sensitive**
- `CLERK_PUBLISHABLE_KEY=...`
- `CLERK_JWT_KEY=...` (recommended; public verification key, server-only config)
- `EXPECTED_CLERK_ORG_ID=org_...`
- `CUSTOMER_SLUG=<opaque/non-sensitive slug>`

## Customer onboarding

For each customer:

1. Create a Clerk Organization.
2. Create a dedicated Neon project.
3. Apply current Drizzle migrations to that database.
4. Create a dedicated Vercel API project from `apps/api`.
5. Configure API env vars with that customer's database and Clerk org.
6. Deploy API and record its production URL.
7. Create a dedicated Vercel web project from `apps/web`.
8. Set `VITE_API_URL` to the API URL.
9. Set API `FRONTEND_URL` to the final web origin and redeploy if necessary.
10. Verify health, auth, wrong-org rejection, and a DB-backed dashboard request.
11. Confirm confidential Preview/Production env vars are marked Sensitive.

## Releases

Initially, promote releases manually across customer projects. Keep all customer cells on the same schema and application line. If rollout toil becomes material, that is the trigger to design a separate fleet/control-plane system rather than embedding deployment state into the SaaS product database.

## Observability

Vercel supplies function/runtime observability for Hono deployments. Configure a team-level shared log drain or OpenTelemetry destination when deeper cross-project analysis is required. Always tag emitted application telemetry with `customer_slug`/cell metadata and follow `docs/security.md` redaction rules.

## Secrets

Vercel environment variables are the initial deployment injection mechanism. Confidential Preview/Production values should be marked Sensitive. Do not use production credentials for local development or E2E. See `docs/secrets.md` for classification, rotation, and the trigger for adopting a dedicated secrets manager.

## Punchline HQ evaluation deployment

| Project | Root | Stable URL |
|---|---|---|
| `punchline-hq-marketing` | `apps/marketing` | `https://punchline-hq-marketing.vercel.app` |
| `punchline-hq-demo-web` | `apps/web` | `https://punchline-hq-demo-web.vercel.app` |
| `punchline-hq-demo-api` | `apps/api` | `https://punchline-hq-demo-api.vercel.app` |

This evaluation deliberately reuses the `Templates Preview` Clerk development application and the `templates-preview` Neon project. The organization and the `saas-jokes-demo` / `saas-jokes-e2e` branches are isolated synthetic fixtures, but this reuse is an evaluation-only exception to the dedicated-customer-resource invariant above.
