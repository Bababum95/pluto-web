import { beforeEach, describe, expect, it, vi } from 'vitest'

const clearClientSessionMock = vi.fn().mockResolvedValue(undefined)

vi.mock('@/app/store', () => ({
  store: { dispatch: vi.fn() },
}))

vi.mock('../clear-client-session', () => ({
  clearClientSession: (...args: unknown[]) => clearClientSessionMock(...args),
}))

import {
  invalidateSessionAfterUnauthorizedResponse,
  resetUnauthorizedRedirectGuardForTests,
} from '../invalidate-session-after-unauthorized'

describe('invalidateSessionAfterUnauthorizedResponse', () => {
  beforeEach(() => {
    resetUnauthorizedRedirectGuardForTests()
    clearClientSessionMock.mockClear()
    vi.stubGlobal('location', { assign: vi.fn() })
  })

  it('clears session and redirects only once when called repeatedly', async () => {
    invalidateSessionAfterUnauthorizedResponse()
    invalidateSessionAfterUnauthorizedResponse()

    await vi.waitFor(() => {
      expect(clearClientSessionMock).toHaveBeenCalledTimes(1)
    })
    expect(window.location.assign).toHaveBeenCalledTimes(1)
  })
})
