import { expect, test } from '@playwright/test'

test.describe('auth pages', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/v1/auth/me', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Unauthorized' }),
      })
    })
  })

  test('login page renders core fields and password visibility toggle', async ({
    page,
  }) => {
    await page.goto('/login')

    const emailInput = page.locator('input[type="email"]')
    const passwordInput = page.locator('input[type="password"]').first()
    const toggleButton = page.getByRole('button', { name: 'Show password' })

    await expect(emailInput).toBeVisible()
    await expect(passwordInput).toBeVisible()
    await expect(toggleButton).toBeVisible()

    await toggleButton.click()
    await expect(page.locator('input[type="text"]').first()).toBeVisible()
  })

  test('user can navigate between login and register pages', async ({ page }) => {
    await page.goto('/login')
    await page.locator('a[href="/register"]').click()
    await expect(page).toHaveURL(/\/register$/)

    await expect(page.locator('input[type="email"]')).toBeVisible()

    await page.locator('a[href="/login"]').click()
    await expect(page).toHaveURL(/\/login$/)
  })

  test('login form validates password length before submit', async ({ page }) => {
    let loginRequests = 0

    await page.route('**/v1/auth/login', async (route) => {
      loginRequests += 1
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          accessToken: 'token',
          user: {
            id: 'user-1',
            name: 'Test User',
            email: 'user@example.com',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
        }),
      })
    })

    await page.goto('/login')

    await page.getByLabel('Email').fill('user@example.com')
    await page.locator('input[name="password"]').fill('12345')

    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page).toHaveURL(/\/login$/)
    await expect(page.locator('input[name="password"]')).toHaveValue('12345')
    expect(loginRequests).toBe(0)
  })

  test('register page validates confirm password mismatch', async ({ page }) => {
    await page.goto('/register')

    await page.getByLabel('Name').fill('Test User')
    await page.getByLabel('Email').fill('user@example.com')
    await page.getByLabel('Password').first().fill('123456')
    await page.getByLabel('Confirm password').fill('654321')

    await page.getByRole('button', { name: 'Sign up' }).click()

    await expect(page.getByText('Passwords do not match')).toBeVisible()
  })
})
