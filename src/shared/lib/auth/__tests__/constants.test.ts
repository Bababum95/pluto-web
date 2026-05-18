import { afterEach, describe, expect, it, vi } from 'vitest'

describe('auth constants', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('uses custom cookie name from env when provided', async () => {
    vi.stubEnv('VITE_TOKEN_ACCESS_COOKIE_NAME', 'custom_access_token')

    const { TOKEN_COOKIE_NAME } = await import('../constants')

    expect(TOKEN_COOKIE_NAME).toBe('custom_access_token')
  })

  it('falls back to default cookie name when env is empty', async () => {
    vi.stubEnv('VITE_TOKEN_ACCESS_COOKIE_NAME', '')

    const { TOKEN_COOKIE_NAME } = await import('../constants')

    expect(TOKEN_COOKIE_NAME).toBe('access_token')
  })
})
