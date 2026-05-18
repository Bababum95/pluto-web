import { afterEach, describe, expect, it, vi } from 'vitest'

describe('getLocalDataMode', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('returns api-only when env is missing', async () => {
    vi.stubEnv('VITE_LOCAL_DATA_MODE', '')

    const { getLocalDataMode } = await import('../config')

    expect(getLocalDataMode()).toBe('api-only')
  })

  it('returns dexie for a valid env value', async () => {
    vi.stubEnv('VITE_LOCAL_DATA_MODE', 'dexie')

    const { getLocalDataMode } = await import('../config')

    expect(getLocalDataMode()).toBe('dexie')
  })

  it('falls back to api-only for an invalid env value', async () => {
    vi.stubEnv('VITE_LOCAL_DATA_MODE', 'invalid-mode')

    const { getLocalDataMode } = await import('../config')

    expect(getLocalDataMode()).toBe('api-only')
  })
})
