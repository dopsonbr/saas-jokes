import type { CustomerAuthVariables } from '@punchline-hq/auth/server'
import {
  createJokeInputSchema,
  jokeIdSchema,
  shareTokenSchema,
  updateJokeInputSchema,
} from '@punchline-hq/contracts'
import { createDb } from '@punchline-hq/db'
import { createLogger } from '@punchline-hq/telemetry'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { requireCustomerAuth } from './auth.js'
import { env } from './env.js'
import { createJokeService } from './joke-service.js'

const app = new Hono<{ Variables: CustomerAuthVariables }>()
const db = createDb(env.DATABASE_URL)
const jokes = createJokeService(db, env.FRONTEND_URL)
const log = createLogger({ service: 'api', customer_slug: env.CUSTOMER_SLUG })

app.use(
  '*',
  cors({
    origin: env.FRONTEND_URL,
    allowHeaders: ['Content-Type', 'Authorization'],
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
