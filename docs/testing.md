# End-to-end testing

The starter uses one Playwright suite for both the browser and the HTTP API. There is no CI requirement; E2E is a local/pre-release command that uses a synthetic customer cell.

## What is exercised

### API E2E

The `api` Playwright project starts the real local Hono server and verifies over HTTP:

- `/health` is public
- protected endpoints reject unauthenticated requests
- a session for another Clerk organization receives `403`
- invalid authenticated writes are rejected by contract validation
- an authenticated member can create, update, publish, publicly read, revoke, and archive a joke
- lifecycle operations persist through the configured Neon database

API tests use Playwright's request client; they do not import API handlers directly.

### Web E2E

The browser projects start the real Vite SPA and paired API and verify:

- signed-out users see the auth boundary
- a Clerk test user can establish an authenticated session
- the expected Clerk organization is made active
- the joke portfolio renders data from the API
- a user can create and edit a joke through UI -> HTTP API -> Neon
- a user can publish a public link and later revoke it
- an invalid or revoked public link fails closed without requiring sign-in

## Test environment

Copy:

```bash
cp tests/e2e/.env.e2e.example tests/e2e/.env.e2e.local
```

Populate it with a **Clerk development instance** and **dedicated Neon test database**. Create a synthetic user (a `+clerk_test` address is recommended by Clerk for tests), make that user a member of `EXPECTED_CLERK_ORG_ID`, and also provide a second organization in `E2E_WRONG_CLERK_ORG_ID` for authorization-boundary coverage.

Apply migrations before running E2E:

```bash
DATABASE_URL='<e2e database url>' pnpm --filter @punchline-hq/db db:migrate
```

Install the browser once:

```bash
pnpm e2e:install
```

Then run:

```bash
pnpm e2e          # API + web
pnpm e2e:api      # HTTP API only
pnpm e2e:web      # SPA flows only
```

Playwright starts the local API and web servers automatically. Existing servers on ports 3101/5177 are reused. The suite runs with one worker because Clerk's active organization belongs to the shared synthetic browser session.

To certify an already deployed cell, override the two origins while keeping the Clerk fixture values in the environment:

```bash
E2E_WEB_URL=https://<customer-web-domain> \
E2E_API_URL=https://<customer-api-domain> \
pnpm e2e
```

## Deliberate omissions

The E2E suite does not use production customer data, production Clerk credentials, or a production Neon project. It verifies one equal-permission organization-member role because role differentiation is outside the Punchline HQ evaluation scope.
