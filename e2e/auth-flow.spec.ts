import { expect, test } from '@playwright/test'

test.describe('auth pages', () => {
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
})
