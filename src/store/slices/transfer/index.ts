import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { Transfer } from '@/features/transfer/types'

import { createTransfer, deleteTransfer, fetchTransfers } from './async-thunks'
import type { TransferState } from './types'

const initialState: TransferState = {
  transfers: [],
  status: 'idle',
}

export const transferSlice = createSlice({
  name: 'transfer',
  initialState,
  reducers: {
    setTransfers: (state, action: PayloadAction<Transfer[]>) => {
      state.transfers = action.payload
    },
    addTransfer: (state, action: PayloadAction<Transfer>) => {
      state.transfers.push(action.payload)
    },
    removeTransfer: (state, action: PayloadAction<string>) => {
      state.transfers = state.transfers.filter((t) => t.id !== action.payload)
    },
    clearTransfers: (state) => {
      state.transfers = []
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransfers.pending, (state) => {
        state.status = 'pending'
      })
      .addCase(fetchTransfers.fulfilled, (state, action) => {
        state.status = 'success'
        state.transfers = action.payload
      })
      .addCase(fetchTransfers.rejected, (state) => {
        state.status = 'failed'
      })
      .addCase(createTransfer.pending, (state) => {
        state.status = 'pending'
      })
      .addCase(createTransfer.fulfilled, (state, action) => {
        state.status = 'success'
        state.transfers.push(action.payload)
      })
      .addCase(createTransfer.rejected, (state) => {
        state.status = 'failed'
      })
      .addCase(deleteTransfer.fulfilled, (state, action) => {
        state.transfers = state.transfers.filter(
          (t) => t.id !== action.meta.arg
        )
      })
  },
})

export const { setTransfers, addTransfer, removeTransfer, clearTransfers } =
  transferSlice.actions

export * from './selectors'
export * from './async-thunks'
export default transferSlice.reducer
