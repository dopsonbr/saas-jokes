# Plan: Punchline HQ MVP and starter evaluation

## Outcome

A deployed evaluation product where a Clerk organization can build, save, publish, revoke, and archive structured jokes through a Vite SPA, Hono API, and Neon database, with a separate public marketing site.

## Constraints

- Preserve the SPA → HTTP API → Neon boundary and organization-pinned Clerk authorization.
- Do not add `tenant_id`, a control plane, AI generation, GitHub delivery, or a required CI pipeline.
- Public routes return only published joke content; customer payloads never enter shared telemetry.
- The reused Clerk application and Neon project are synthetic evaluation resources, not a production customer cell.

## API changes

- Authenticated dashboard and joke create/read/update/list endpoints under `/v1`.
- Authenticated publish, revoke, and archive lifecycle endpoints.
- Exceptional public read endpoint at `/public/v1/jokes/:shareToken`.
- Explicit Zod DTO/input schemas owned by `packages/contracts` and browser calls owned by `packages/api-client`.

## Database changes

- Replace generic `records` with `jokes` including structured content, tags, status, creator, timestamps, and a nullable unique UUID share token.
- Commit a forward migration and seed only synthetic workplace jokes.
- Use separate `saas-jokes-demo` and `saas-jokes-e2e` Neon branches for this evaluation.

## UI states

- Auth loading and signed-out boundaries.
- Dashboard loading, error, empty, filtered-empty, and populated states.
- Builder validation, saving, success, and API error states.
- Published link copy/open/revoke and archived behavior.
- Public loading, published, invalid, and revoked states.

## Implementation steps

1. Preserve the renamed starter baseline and stabilize its dependency/toolchain failures.
2. Implement contracts, migration, API service/handlers, and browser client.
3. Implement routed product UI, public share page, and marketing experience.
4. Configure synthetic Clerk/Neon cells and local E2E environment.
5. Run static, API, browser, and responsive verification.
6. Deploy three Vercel projects and record source/deployment evidence.

## Acceptance criteria

- [x] Clean frozen install and `pnpm check` pass.
- [x] API E2E proves authentication, wrong-org rejection, validation, persistence, publish, revoke, and archive.
- [x] Browser E2E proves the organization member workflow and signed-out public behavior.
- [x] Marketing and product routes are usable at mobile and desktop widths.
- [x] All three Vercel deployments are `READY` and representative runtime routes pass.
- [x] Evaluation scorecard distinguishes starter defects, product work, and synthetic versus deployed evidence.

## Verification evidence

Evidence is finalized in `docs/starter-evaluation.md`.
