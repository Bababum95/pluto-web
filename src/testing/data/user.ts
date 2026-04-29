import type { UserDto } from '@/features/user/types'

export const mockUser: UserDto = {
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

export function createMockUser(overrides?: Partial<UserDto>): UserDto {
  return { ...mockUser, ...overrides }
}
