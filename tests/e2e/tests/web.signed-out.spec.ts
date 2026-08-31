import { expect, test } from '@playwright/test'

test('signed-out visitor sees the organization authentication boundary', async ({
  page,
}) => {
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: 'Your team’s jokes, under control.' }),
  ).toBeVisible()
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
})

test('invalid public link fails closed without requiring sign-in', async ({
  page,
}) => {
  await page.goto('/share/00000000-0000-4000-8000-000000000000')
  await expect(
    page.getByRole('heading', { name: 'This punchline has left the building' }),
  ).toBeVisible()
})
