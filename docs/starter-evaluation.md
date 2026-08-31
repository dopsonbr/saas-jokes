# SaaS Cell Starter Evaluation: Punchline HQ

## Evaluation boundary

- Starter source: `dopsonbr/saas-cell-starter`
- Starter commit: `fb89ce1da9fe86334809ea6ac0649d7f723bec1f`
- Initialized baseline: `24336ec`
- Stabilized baseline: `c631bdd`
- Delivery: local Git plus direct Vercel deploy; no GitHub remote or CI
- Resources: synthetic Clerk development instance and isolated Neon evaluation branches

The Vercel deployments use stable production-target aliases, but the Clerk and Neon resources are synthetic evaluation infrastructure. They are not evidence of a production customer launch.

## Out-of-box findings

The starter's architecture and ownership boundaries were clear enough to preserve without an ADR. The first clean install did not pass its own `pnpm check` because dependency manifests floated on `latest`, there was no lockfile, the database package lacked Node types, the Clerk UI theme packages resolved incompatibly, TypeScript 7 rejected an existing `baseUrl`, and the initial Biome configuration required migration. The repository also contained no generated database migration.

Stabilization pinned Node 24, pnpm 10.25.0, TypeScript 5.9.3, and Biome 2.5.11; committed a lockfile; removed the optional incompatible Clerk theme preset; added the missing Node types; updated TypeScript/Biome configuration; and formatted the baseline. These changes are isolated from product work.

## Scorecard

| Area | Score | Evidence / conclusion |
|---|---:|---|
| Architecture clarity | 5/5 | Runtime, auth, database, package, and telemetry boundaries were explicit and preserved. |
| Project initialization | 4/5 | Rename script handled product/package renaming; it also rewrote starter-oriented documentation that required product cleanup. |
| Dependency stability | 2/5 | Floating `latest` ranges and no lockfile made the current baseline fail immediately. |
| Domain replacement | 4/5 | Generic record seams were localized across contracts, DB, API, client, and tests. |
| Clerk integration | 4/5 | Real sign-in, organization pinning, unauthenticated `401`, and wrong-org `403` passed locally and when deployed. A shared Clerk test user's active organization made the suite intentionally serial. |
| Neon/Drizzle integration | 4/5 | Forward migration, isolated demo/E2E branches, seed, CRUD, publish, revoke, and archive all passed. The starter should have shipped an initial migration. |
| Shared UI/product composition | 4/5 | Shared primitives supported a polished marketing site and responsive workspace; desktop and 390 px production probes had no horizontal overflow or blocking overlays. |
| Testing ergonomics | 4/5 | One real Playwright topology covered browser, HTTP, Clerk, and Neon with 8 passing tests. Dedicated ports and serial Clerk fixture handling had to be added. |
| Vercel deployment | 3/5 | Three production-target projects are healthy, but direct monorepo deployment required custom project configuration and two API packaging fixes for workspace ESM output. |
| Documentation/operations | 4/5 | Architecture, secrets, deployment, testing, and agent instructions were unusually explicit for a starter. |

Overall score: **3.8/5**. The starter is strongest as an architectural and operational scaffold. Its largest efficacy tax is baseline reproducibility and direct-deployment packaging, not domain customization.

## Verification record

### Local and data

- `pnpm install --frozen-lockfile`: passed with pnpm 10.25.0.
- `pnpm check`: typecheck, Biome, package builds, API build, SPA build, and marketing build passed.
- Local Playwright topology: 8/8 passed in 14.5 seconds against real Clerk development authentication, Hono HTTP, and the isolated `saas-jokes-e2e` Neon branch.
- Drizzle migration applied to `saas-jokes-demo` and `saas-jokes-e2e`; only the demo branch received synthetic seed jokes.
- Local desktop and 390 x 844 browser probes found the marketing and signed-out workspace layouts usable, without horizontal overflow or blocking overlays.

### Deployed artifacts

| Artifact | Stable URL | Deployment | Source commit | Result |
|---|---|---|---|---|
| Marketing | `https://punchline-hq-marketing.vercel.app` | `dpl_AnmunaN5oWg1ACfbDPgdNF4gFz8h` | `884c3cc0a84d709e5e372724e236b8f8aeb92fd5` | `READY`, production target, `/` 200 |
| Workspace | `https://punchline-hq-demo-web.vercel.app` | `dpl_5VGu8GSk8gG5ws2Jfmn3AUEoAdJf` | `884c3cc0a84d709e5e372724e236b8f8aeb92fd5` | `READY`, production target, `/` and `/jokes/new` 200 |
| API | `https://punchline-hq-demo-api.vercel.app` | `dpl_A1JrztfQm1epVnoDGo51jKFkXG36` | `eb9111b32db14de75953f0870e14fd17d6dc494c` | `READY`, production target, health 200 |

The deployed Playwright run passed all 8 tests in 14.5 seconds. It proved Clerk sign-in, organization activation, unauthenticated and wrong-organization rejection, contract validation, Neon persistence, browser create/edit, publish, public read, revoke, and archive through the stable production-target aliases. The invalid public UUID returned 404. Production browser probes repeated the responsive and overlay checks. Runtime logs contained event names, cell slug, and opaque joke IDs only—no setup or punchline payloads.

The Vercel targets are live and usable, but the connected Clerk development instance and Neon evaluation branches remain synthetic demo infrastructure. This is deployment evidence, not production-customer certification.

## Recommendations to the starter

1. Commit a lockfile and pin the package manager, Node line, TypeScript, Biome, and mutually compatible Clerk packages.
2. Make the clean starter's aggregate check pass before publishing a template revision.
3. Commit an initial migration or make generation an explicit mandatory initialization step.
4. Add a deterministic local/direct-deploy recipe for the three-project monorepo, not only Git-integrated project guidance.
5. Export built JavaScript for server-side workspace packages and require explicit `.js` ESM specifiers so Vercel output tracing is reliable.
6. Keep the physical customer-cell architecture, explicit HTTP boundary, secret classification, and real E2E topology; these were effective constraints.
