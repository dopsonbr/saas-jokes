# Plan: TanStack AI joke collaborator

## Outcome

Organization members can brainstorm and refine jokes with a prominent, interactive collaborator, review structured suggestions, and explicitly apply changes before saving.

## Constraints

- Preserve the SPA -> authenticated HTTP API -> Neon boundary.
- Keep OpenAI credentials and model configuration server-side.
- Default to deterministic mock responses until an OpenAI API key is configured.
- Never log prompts, joke content, responses, or provider credentials.

## API changes

- Add an authenticated `POST /v1/ai/joke-collaborator` TanStack AI SSE endpoint.
- Accept AG-UI chat input with allowlisted collaborator intent and current draft context.
- Stream a typed reply with an optional partial joke suggestion.

## Database changes

None. Conversation history is session-only and suggestions remain local until the user saves the joke.

## UI states

- Prominent dashboard entry point and collaborator panel in new/edit flows.
- Empty, ready, streaming, stopped, error, retry, and successful suggestion states.
- Per-field and apply-all review controls; no automatic persistence.

## Implementation steps

1. Add shared collaborator schemas and mock/OpenAI provider configuration.
2. Implement the protected TanStack AI streaming endpoint.
3. Convert the joke form to controlled draft state and add the collaborator UI.
4. Add dashboard promotion, tests, and configuration documentation.

## Acceptance criteria

- [x] Mock mode deterministically exercises the authenticated TanStack AI stream.
- [x] Suggestions can be applied per field or all at once without saving automatically.
- [x] OpenAI mode is server-only and targets `gpt-5.6-luna`.
- [x] Existing joke lifecycle behavior remains intact.
- [x] Static checks and builds pass; relevant API/browser E2E coverage is committed.

## Verification evidence

- `pnpm lint` passed.
- `pnpm typecheck` passed across all workspace packages and apps.
- `pnpm build` passed; the collaborator is emitted as a separate lazy-loaded browser chunk.
- A direct mock-stream probe emitted the complete TanStack lifecycle and the expected validated structured suggestion.
- `pnpm e2e:api` and `pnpm e2e:web` were not runnable because `tests/e2e/.env.e2e.local` is unavailable; the suites require the repository's Clerk development user/organizations and dedicated Neon test database.
