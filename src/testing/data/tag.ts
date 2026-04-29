import type { TagDto } from '@/features/tag/types'

export const mockTag: TagDto = {
  id: 'tag-1',
  name: 'food',
  color: '#6B7280',
  icon: 'tag',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

export function createMockTag(overrides?: Partial<TagDto>): TagDto {
  return { ...mockTag, ...overrides }
}
