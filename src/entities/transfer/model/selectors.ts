import { createSelector } from '@reduxjs/toolkit'

import type { RootState } from '@/store'
import type { TransferDto } from '@/features/transfer/types'

export const selectTransfers = (state: RootState) => state.transfer.transfers
export const selectTransfersStatus = (state: RootState) => state.transfer.status
export const selectTransferById = (id: string) => (state: RootState) =>
  state.transfer.transfers.find((t) => t.id === id)

type TransfersByDay = {
  date: string
  list: TransferDto[]
}

export const selectTransfersByDay = createSelector(
  selectTransfers,
  (transfers): TransfersByDay[] => {
    const result: TransfersByDay[] = []
    let currentGroup: TransfersByDay | null = null

    for (const transfer of transfers) {
      const date = new Date(transfer.createdAt).toISOString().slice(0, 10)
      if (!currentGroup || currentGroup.date !== date) {
        currentGroup = {
          date,
          list: [],
        }
        result.push(currentGroup)
      }
      currentGroup.list.push(transfer)
    }

    return result
  }
)
