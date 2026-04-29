import type { TransferDto } from '@/features/transfer/types'

export const mockTransfer: TransferDto = {
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
  overrides?: Partial<TransferDto>
): TransferDto {
  return { ...mockTransfer, ...overrides }
}
