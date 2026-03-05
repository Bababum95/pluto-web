import type { Transfer } from '@/features/transfer/types'

export const mockTransfer: Transfer = {
  id: 'transfer-1',
  from: {
    account: 'account-1',
    value: 10000,
    scale: 2,
  },
  to: {
    account: 'account-2',
    value: 9100,
    scale: 2,
  },
  rate: 0.91,
  fee: { value: 0, scale: 2 },
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

export function createMockTransfer(
  overrides?: Partial<Transfer>
): Transfer {
  return { ...mockTransfer, ...overrides }
}
