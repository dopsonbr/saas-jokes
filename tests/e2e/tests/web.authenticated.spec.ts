import { expect, test } from '@playwright/test'

test('organization member can create, edit, publish, and revoke a joke', async ({
  page,
}) => {
  const title = `Browser joke ${Date.now()}`
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: 'Joke portfolio' }),
  ).toBeVisible()

  await page.getByRole('link', { name: 'New joke' }).click()
  await page.getByLabel('Internal title').fill(title)
  await page.getByLabel('Setup').fill('Why did the browser open a new tab?')
  await page
    .getByRole('textbox', { name: 'Punchline', exact: true })
    .fill('It wanted a fresh perspective.')
  await page.getByLabel('Tags').fill('browser, e2e')
  await page.getByRole('button', { name: 'Save draft' }).click()

  await expect(page.getByRole('heading', { name: title })).toBeVisible()
  await page
    .getByRole('textbox', { name: 'Punchline', exact: true })
    .fill('It needed a fresh perspective.')
  await page.getByRole('button', { name: 'Save changes' }).click()
  await expect(page.getByText('draft', { exact: true })).toBeVisible()

  await page.getByRole('button', { name: 'Publish share link' }).click()
  await expect(page.getByText('published', { exact: true })).toBeVisible()
  const publicUrl = await page
    .getByRole('link', { name: 'Open public page' })
    .getAttribute('href')
  expect(publicUrl).toBeTruthy()

  await page.goto(publicUrl ?? '/')
  await expect(
    page.getByText('Why did the browser open a new tab?'),
  ).toBeVisible()
  await expect(page.getByText('It needed a fresh perspective.')).toBeVisible()

  await page.goBack()
  await page.getByRole('button', { name: 'Revoke link' }).click()
  await expect(
    page.getByRole('button', { name: 'Publish share link' }),
  ).toBeVisible()
  await page.goto(publicUrl ?? '/')
  await expect(
    page.getByRole('heading', { name: 'This punchline has left the building' }),
  ).toBeVisible()
})
