import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/shared/lib/local-storage/config', () => ({
  LOCAL_DATA_MODE: 'dexie' as const,
  getLocalDataMode: (): 'dexie' | 'api-only' => 'dexie',
}))

vi.mock('@/entities/user', () => ({
  clearUser: vi.fn(() => ({ type: 'user/clearUser' })),
  userRepository: { clear: vi.fn().mockResolvedValue(undefined) },
}))

vi.mock('@/shared/lib/local-storage/session-repository', () => ({
  sessionRepository: { clear: vi.fn().mockResolvedValue(undefined) },
}))

vi.mock('@/shared/lib/local-storage/db', () => ({
  db: {
    outbox: {
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          delete: vi.fn().mockResolvedValue(undefined),
        })),
      })),
    },
  },
}))

vi.mock('../access-token', () => ({
  removeAccessToken: vi.fn(),
}))

import { clearUser, userRepository } from '@/entities/user'
import { sessionRepository } from '@/shared/lib/local-storage/session-repository'
import { removeAccessToken } from '../access-token'
import { clearClientSession } from '../clear-client-session'

describe('clearClientSession (dexie mode)', () => {
  const dispatch = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('clears token, user state, and local dexie session data', async () => {
    await clearClientSession(dispatch)

    expect(removeAccessToken).toHaveBeenCalled()
    expect(dispatch).toHaveBeenCalledWith(clearUser())
    expect(userRepository.clear).toHaveBeenCalled()
    expect(sessionRepository.clear).toHaveBeenCalled()
  })
})
