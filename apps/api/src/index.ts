import type { CustomerAuthVariables } from '@punchline-hq/auth/server'
import {
  createJokeInputSchema,
  jokeCollaboratorContextSchema,
  jokeIdSchema,
  shareTokenSchema,
  updateJokeInputSchema,
} from '@punchline-hq/contracts'
import { createDb } from '@punchline-hq/db'
import { createLogger } from '@punchline-hq/telemetry'
import {
  chatParamsFromRequestBody,
  toServerSentEventsResponse,
} from '@tanstack/ai'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { requireCustomerAuth } from './auth.js'
import { env } from './env.js'
import { createJokeCollaboratorStream } from './joke-collaborator.js'
import { createJokeService } from './joke-service.js'

const app = new Hono<{ Variables: CustomerAuthVariables }>()
const db = createDb(env.DATABASE_URL)
const jokes = createJokeService(db, env.FRONTEND_URL)
const log = createLogger({ service: 'api', customer_slug: env.CUSTOMER_SLUG })

function aiCredentialMode(
  requestOidcToken?: string,
): 'api-key' | 'oidc' | 'mock' | 'missing' {
  if (env.AI_PROVIDER === 'mock') return 'mock'
  if (env.AI_PROVIDER === 'openai') {
    return process.env.OPENAI_API_KEY ? 'api-key' : 'missing'
  }
  if (process.env.AI_GATEWAY_API_KEY) return 'api-key'
  return requestOidcToken || process.env.VERCEL_OIDC_TOKEN ? 'oidc' : 'missing'
}

function aiErrorCategory(error: unknown): string {
  const message = error instanceof Error ? error.message.toLowerCase() : ''
  if (message.includes('credit card')) return 'billing_verification_required'
  if (message.includes('api key') || message.includes('oidc')) {
    return 'provider_auth_missing'
  }
  if (message.includes('schema')) return 'structured_output_error'
  return 'provider_initialization_error'
}

async function* observeCollaboratorStream<T extends { type: string }>(
  stream: AsyncIterable<T>,
  requestOidcToken?: string,
): AsyncGenerator<T> {
  for await (const chunk of stream) {
    if (chunk.type === 'RUN_ERROR') {
      const message =
        'message' in chunk && typeof chunk.message === 'string'
          ? chunk.message
          : ''
      log.error('joke_collaborator.stream_failed', {
        error_category: aiErrorCategory(new Error(message)),
        credential_mode: aiCredentialMode(requestOidcToken),
      })
    }
    yield chunk
  }
}

app.use(
  '*',
  cors({
    origin: env.FRONTEND_URL,
    allowHeaders: ['Content-Type', 'Authorization', 'X-Run-Id'],
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  }),
)

app.get('/health', (c) => c.json({ ok: true, service: 'api' }))

app.get('/public/v1/jokes/:shareToken', async (c) => {
  const token = shareTokenSchema.safeParse(c.req.param('shareToken'))
  if (!token.success) return c.json({ error: 'Not found' }, 404)
  const joke = await jokes.publicByToken(token.data)
  return joke ? c.json(joke) : c.json({ error: 'Not found' }, 404)
})

app.use('/v1/*', requireCustomerAuth)

app.get('/v1/dashboard', async (c) => c.json(await jokes.dashboard()))
app.get('/v1/jokes', async (c) => c.json(await jokes.list()))

app.post('/v1/ai/joke-collaborator', async (c) => {
  const params = await chatParamsFromRequestBody(
    await c.req.json().catch(() => null),
  ).catch((error: unknown) => {
    log.error('joke_collaborator.rejected', {
      error_name: error instanceof Error ? error.name : 'UnknownError',
    })
    return null
  })
  if (!params) return c.json({ error: 'Invalid collaborator request' }, 400)

  if (
    params.messages.length > 24 ||
    JSON.stringify(params.messages).length > 20_000
  ) {
    return c.json({ error: 'Collaborator conversation is too long' }, 400)
  }
  const context = jokeCollaboratorContextSchema.safeParse(params.forwardedProps)
  if (!context.success) {
    return c.json({ error: 'Invalid collaborator context' }, 400)
  }

  try {
    const abortController = new AbortController()
    const requestOidcToken = c.req.header('x-vercel-oidc-token')
    const stream = createJokeCollaboratorStream({
      provider: env.AI_PROVIDER,
      context: context.data,
      messages: params.messages,
      threadId: params.threadId,
      runId: params.runId,
      abortController,
      vercelGatewayToken: requestOidcToken ?? process.env.VERCEL_OIDC_TOKEN,
    })
    log.info('joke_collaborator.started', {
      provider: env.AI_PROVIDER,
      credential_mode: aiCredentialMode(requestOidcToken),
      intent: context.data.intent,
    })
    return toServerSentEventsResponse(
      observeCollaboratorStream(stream, requestOidcToken),
      { abortController },
    )
  } catch (error) {
    log.error('joke_collaborator.failed', {
      error_name: error instanceof Error ? error.name : 'UnknownError',
      error_category: aiErrorCategory(error),
      credential_mode: aiCredentialMode(c.req.header('x-vercel-oidc-token')),
    })
    return c.json({ error: 'Collaborator unavailable' }, 500)
  }
})

app.get('/v1/jokes/:jokeId', async (c) => {
  const id = jokeIdSchema.safeParse(c.req.param('jokeId'))
  if (!id.success) return c.json({ error: 'Not found' }, 404)
  const joke = await jokes.get(id.data)
  return joke ? c.json(joke) : c.json({ error: 'Not found' }, 404)
})

app.post('/v1/jokes', async (c) => {
  const parsed = createJokeInputSchema.safeParse(
    await c.req.json().catch(() => null),
  )
  if (!parsed.success) {
    return c.json(
      { error: 'Invalid request', issues: parsed.error.flatten() },
      400,
    )
  }
  const created = await jokes.create(parsed.data, c.get('auth').userId)
  log.info('joke.created', { joke_id: created.id })
  return c.json(created, 201)
})

app.patch('/v1/jokes/:jokeId', async (c) => {
  const id = jokeIdSchema.safeParse(c.req.param('jokeId'))
  const parsed = updateJokeInputSchema.safeParse(
    await c.req.json().catch(() => null),
  )
  if (!id.success) return c.json({ error: 'Not found' }, 404)
  if (!parsed.success) {
    return c.json(
      { error: 'Invalid request', issues: parsed.error.flatten() },
      400,
    )
  }
  const updated = await jokes.update(id.data, parsed.data)
  return updated
    ? c.json(updated)
    : c.json({ error: 'Joke not found or archived' }, 404)
})

app.post('/v1/jokes/:jokeId/share', async (c) => {
  const id = jokeIdSchema.safeParse(c.req.param('jokeId'))
  if (!id.success) return c.json({ error: 'Not found' }, 404)
  const shared = await jokes.share(id.data)
  if (!shared) return c.json({ error: 'Joke not found or archived' }, 404)
  log.info('joke.shared', { joke_id: id.data })
  return c.json(shared)
})

app.delete('/v1/jokes/:jokeId/share', async (c) => {
  const id = jokeIdSchema.safeParse(c.req.param('jokeId'))
  if (!id.success) return c.json({ error: 'Not found' }, 404)
  const joke = await jokes.revoke(id.data)
  return joke
    ? c.json(joke)
    : c.json({ error: 'Joke not found or archived' }, 404)
})

app.post('/v1/jokes/:jokeId/archive', async (c) => {
  const id = jokeIdSchema.safeParse(c.req.param('jokeId'))
  if (!id.success) return c.json({ error: 'Not found' }, 404)
  const joke = await jokes.archive(id.data)
  return joke ? c.json(joke) : c.json({ error: 'Joke not found' }, 404)
})

app.onError((error, c) => {
  log.error('request.failed', { error_name: error.name, route: c.req.path })
  return c.json({ error: 'Internal server error' }, 500)
})

export default app
