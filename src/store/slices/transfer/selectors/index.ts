import type { RootState } from '@/store'

export const selectTransfers = (state: RootState) => state.transfer.transfers
export const selectTransfersStatus = (state: RootState) => state.transfer.status
export const selectTransferById = (id: string) => (state: RootState) =>
  state.transfer.transfers.find((t) => t.id === id)
