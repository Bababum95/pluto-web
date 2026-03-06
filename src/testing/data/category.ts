import type { Category } from '@/features/category/types'

export const mockCategory: Category = {
  id: 'category-1',
  color: '#FF5733',
  icon: 'wallet',
  name: 'Food & Dining',
  type: 'expense',
  order: 0,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

export function createMockCategory(
  overrides?: Partial<Category>
): Category {
  return { ...mockCategory, ...overrides }
}
