import { describe, it, expect, beforeEach, vi } from 'vitest'
import { syncCoordinator } from '../sync-coordinator'
import { userRepository } from '@/entities/user'
import { settingsRepository } from '@/entities/settings/local/repository'
import { tagRepository } from '@/entities/tag/local/repository'
import { authControllerGetProfile } from '@/lib/api/generated/auth/auth'
import { settingsControllerFindOne } from '@/lib/api/generated/settings/settings'
import { tagControllerFindAll } from '@/lib/api/generated/tags/tags'
import { registerSyncEntities } from '../register-entities'

vi.mock('@/entities/user', () => ({
  userRepository: {
    syncFromApi: vi.fn(),
  },
}))

vi.mock('@/entities/settings/local/repository', () => ({
  settingsRepository: {
    syncFromApi: vi.fn(),
  },
}))

vi.mock('@/entities/tag/local/repository', () => ({
  tagRepository: {
    syncFromApi: vi.fn(),
  },
}))

vi.mock('@/lib/api/generated/auth/auth', () => ({
  authControllerGetProfile: vi.fn(),
}))

vi.mock('@/lib/api/generated/settings/settings', () => ({
  settingsControllerFindOne: vi.fn(),
}))

vi.mock('@/lib/api/generated/tags/tags', () => ({
  tagControllerFindAll: vi.fn(),
}))

describe('registerSyncEntities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should register all entity sync handlers', () => {
    const registerSpy = vi.spyOn(syncCoordinator, 'registerEntity')

    registerSyncEntities()

    expect(registerSpy).toHaveBeenCalledWith('user', expect.any(Function))
    expect(registerSpy).toHaveBeenCalledWith('settings', expect.any(Function))
    expect(registerSpy).toHaveBeenCalledWith('tag', expect.any(Function))
    expect(registerSpy).toHaveBeenCalledTimes(3)
  })

  it('should be idempotent - multiple calls should only register once', () => {
    // First call registers the handlers
    expect(syncCoordinator.hasEntity('user')).toBe(true)
    expect(syncCoordinator.hasEntity('settings')).toBe(true)
    expect(syncCoordinator.hasEntity('tag')).toBe(true)

    // Subsequent calls should not change the handlers
    const userHandler = syncCoordinator.getEntityHandler('user')
    const settingsHandler = syncCoordinator.getEntityHandler('settings')
    const tagHandler = syncCoordinator.getEntityHandler('tag')

    registerSyncEntities()

    expect(syncCoordinator.getEntityHandler('user')).toBe(userHandler)
    expect(syncCoordinator.getEntityHandler('settings')).toBe(settingsHandler)
    expect(syncCoordinator.getEntityHandler('tag')).toBe(tagHandler)
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

  it('should sync settings from API when handler is called', async () => {
    const mockSettings = {
      id: 'settings-1',
      account: null,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    }

    vi.mocked(settingsControllerFindOne).mockResolvedValue(mockSettings)
    vi.mocked(settingsRepository.syncFromApi).mockResolvedValue()

    registerSyncEntities()

    const settingsHandler = syncCoordinator.getEntityHandler('settings')

    expect(settingsHandler).toBeDefined()

    await settingsHandler!()

    expect(settingsControllerFindOne).toHaveBeenCalledTimes(1)
    expect(settingsRepository.syncFromApi).toHaveBeenCalledWith(mockSettings)
  })

  it('should sync tags from API when handler is called', async () => {
    const mockTags = [
      {
        id: 'tag-1',
        name: 'Food',
        color: '#FF0000',
        icon: 'food',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
      {
        id: 'tag-2',
        name: 'Transport',
        color: '#00FF00',
        icon: 'car',
        createdAt: '2024-01-02T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z',
      },
    ]

    vi.mocked(tagControllerFindAll).mockResolvedValue(mockTags)
    vi.mocked(tagRepository.syncFromApi).mockResolvedValue()

    registerSyncEntities()

    const tagHandler = syncCoordinator.getEntityHandler('tag')

    expect(tagHandler).toBeDefined()

    await tagHandler!()

    expect(tagControllerFindAll).toHaveBeenCalledTimes(1)
    expect(tagRepository.syncFromApi).toHaveBeenCalledWith(mockTags)
  })

  it('should log error and rethrow when user sync fails', async () => {
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

  it('should log error and rethrow when settings sync fails', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})
    const error = new Error('Settings API error')

    vi.mocked(settingsControllerFindOne).mockRejectedValue(error)

    registerSyncEntities()

    const settingsHandler = syncCoordinator.getEntityHandler('settings')

    await expect(settingsHandler!()).rejects.toThrow('Settings API error')
    expect(consoleErrorSpy).toHaveBeenCalledWith('Settings sync failed:', error)

    consoleErrorSpy.mockRestore()
  })

  it('should log error and rethrow when tag sync fails', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})
    const error = new Error('Tag API error')

    vi.mocked(tagControllerFindAll).mockRejectedValue(error)

    registerSyncEntities()

    const tagHandler = syncCoordinator.getEntityHandler('tag')

    await expect(tagHandler!()).rejects.toThrow('Tag API error')
    expect(consoleErrorSpy).toHaveBeenCalledWith('Tag sync failed:', error)

    consoleErrorSpy.mockRestore()
  })
})
