import { describe, it, expect, beforeEach, vi } from 'vitest'
import { syncCoordinator } from '../sync-coordinator'
import { userRepository } from '@/entities/user'
import { authControllerGetProfile } from '@/lib/api/generated/auth/auth'
import { registerSyncEntities } from '../register-entities'

vi.mock('@/entities/user', () => ({
  userRepository: {
    syncFromApi: vi.fn(),
  },
}))

vi.mock('@/lib/api/generated/auth/auth', () => ({
  authControllerGetProfile: vi.fn(),
}))

describe('registerSyncEntities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should register user entity sync handler', () => {
    const registerSpy = vi.spyOn(syncCoordinator, 'registerEntity')

    registerSyncEntities()

    expect(registerSpy).toHaveBeenCalledWith('user', expect.any(Function))
  })

  it('should be idempotent - multiple calls should only register once', () => {
    // First call registers the handler
    expect(syncCoordinator.hasEntity('user')).toBe(true)

    // Subsequent calls should not change the handler
    const firstHandler = syncCoordinator.getEntityHandler('user')
    registerSyncEntities()
    const secondHandler = syncCoordinator.getEntityHandler('user')

    expect(firstHandler).toBe(secondHandler)
  })

  it('should sync user from API when handler is called', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      currency: 'USD',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    }

    vi.mocked(authControllerGetProfile).mockResolvedValue(mockUser)
    vi.mocked(userRepository.syncFromApi).mockResolvedValue()

    registerSyncEntities()

    // Get the registered handler
    const userHandler = syncCoordinator.getEntityHandler('user')

    expect(userHandler).toBeDefined()

    // Call the handler
    await userHandler!()

    expect(authControllerGetProfile).toHaveBeenCalledTimes(1)
    expect(userRepository.syncFromApi).toHaveBeenCalledWith(mockUser)
  })

  it('should log error and rethrow when sync fails', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})
    const error = new Error('API error')

    vi.mocked(authControllerGetProfile).mockRejectedValue(error)

    registerSyncEntities()

    const userHandler = syncCoordinator.getEntityHandler('user')

    await expect(userHandler!()).rejects.toThrow('API error')
    expect(consoleErrorSpy).toHaveBeenCalledWith('User sync failed:', error)

    consoleErrorSpy.mockRestore()
  })
})
