import { expect, type Page, test } from '@playwright/test'

const apiUrl = process.env.E2E_API_URL ?? 'http://localhost:3101'

async function getFreshSessionToken(page: Page) {
  await page.goto('/')
  await page.waitForFunction(() =>
    Boolean(
      (window as unknown as { Clerk?: { session?: unknown } }).Clerk?.session,
    ),
  )
  const token = await page.evaluate(async () => {
    const clerkClient = (
      window as unknown as {
        Clerk?: { session?: { getToken: () => Promise<string | null> } }
      }
    ).Clerk
    return clerkClient?.session?.getToken() ?? null
  })
  if (!token)
    throw new Error('Unable to obtain Clerk session token for API E2E')
  return token
}

test('health is public and the joke API requires authentication', async ({
  request,
}) => {
  const health = await request.get(`${apiUrl}/health`)
  expect(health.status()).toBe(200)
  await expect(health.json()).resolves.toMatchObject({
    ok: true,
    service: 'api',
  })

  const protectedResponse = await fetch(`${apiUrl}/v1/jokes`)
  expect(protectedResponse.status).toBe(401)
})

test('wrong organization receives 403', async ({ page, request }) => {
  const wrongOrgId = process.env.E2E_WRONG_CLERK_ORG_ID
  if (!wrongOrgId) throw new Error('E2E requires E2E_WRONG_CLERK_ORG_ID')
  await page.goto('/')
  await page.waitForFunction(() =>
    Boolean(
      (window as unknown as { Clerk?: { loaded?: boolean } }).Clerk?.loaded,
    ),
  )
  await page.evaluate(async (organization) => {
    const clerkClient = (
      window as unknown as {
        Clerk?: {
          setActive: (input: { organization: string }) => Promise<void>
        }
      }
    ).Clerk
    if (!clerkClient) throw new Error('Clerk did not load')
    await clerkClient.setActive({ organization })
  }, wrongOrgId)
  const token = await getFreshSessionToken(page)
  const response = await request.get(`${apiUrl}/v1/jokes`, {
    headers: { authorization: `Bearer ${token}` },
  })
  expect(response.status()).toBe(403)
  const expectedOrgId = process.env.EXPECTED_CLERK_ORG_ID
  if (!expectedOrgId) throw new Error('E2E requires EXPECTED_CLERK_ORG_ID')
  await page.evaluate(async (organization) => {
    const clerkClient = (
      window as unknown as {
        Clerk?: {
          setActive: (input: { organization: string }) => Promise<void>
        }
      }
    ).Clerk
    if (!clerkClient) throw new Error('Clerk did not load')
    await clerkClient.setActive({ organization })
  }, expectedOrgId)
})

test('authenticated lifecycle persists and revokes a public joke', async ({
  page,
  request,
}) => {
  const token = await getFreshSessionToken(page)
  const headers = {
    authorization: `Bearer ${token}`,
    'content-type': 'application/json',
  }

  const invalid = await request.post(`${apiUrl}/v1/jokes`, {
    headers,
    data: { title: '', setup: '', punchline: '' },
  })
  expect(invalid.status()).toBe(400)

  const title = `API joke ${Date.now()}`
  const createdResponse = await request.post(`${apiUrl}/v1/jokes`, {
    headers,
    data: {
      title,
      setup: 'Why did the test cross the API?',
      punchline: 'To prove the database was on the other side.',
      tags: ['e2e'],
    },
  })
  expect(createdResponse.status()).toBe(201)
  const created = (await createdResponse.json()) as { id: string }

  const updated = await request.patch(`${apiUrl}/v1/jokes/${created.id}`, {
    headers,
    data: { punchline: 'To reach a deterministic conclusion.' },
  })
  expect(updated.status()).toBe(200)

  const shared = await request.post(`${apiUrl}/v1/jokes/${created.id}/share`, {
    headers,
  })
  expect(shared.status()).toBe(200)
  const share = (await shared.json()) as { shareUrl: string }
  const shareToken = share.shareUrl.split('/').at(-1)
  expect(shareToken).toBeTruthy()

  const publicResponse = await request.get(
    `${apiUrl}/public/v1/jokes/${shareToken}`,
  )
  expect(publicResponse.status()).toBe(200)
  await expect(publicResponse.json()).resolves.toMatchObject({
    title,
    punchline: 'To reach a deterministic conclusion.',
  })

  const revoked = await request.delete(
    `${apiUrl}/v1/jokes/${created.id}/share`,
    { headers },
  )
  expect(revoked.status()).toBe(200)
  expect(
    (await request.get(`${apiUrl}/public/v1/jokes/${shareToken}`)).status(),
  ).toBe(404)

  const archived = await request.post(
    `${apiUrl}/v1/jokes/${created.id}/archive`,
    { headers },
  )
  expect(archived.status()).toBe(200)
  expect((await archived.json()).status).toBe('archived')
})
