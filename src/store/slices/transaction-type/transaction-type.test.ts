import { describe, it, expect } from 'vitest'

import transactionTypeReducer, {
  setTransactionType,
  selectTransactionType,
} from './index'
import type { RootState } from '@/store'
import { DEFAULT_TAB } from '@/features/transaction-type/constants'

describe('transactionType slice', () => {
  it('initial state uses DEFAULT_TAB', () => {
    const state = transactionTypeReducer(undefined, { type: '@@INIT' })
    expect(state.transactionType).toBe(DEFAULT_TAB)
  })

  it('setTransactionType updates when value is a valid tab', () => {
    let state = transactionTypeReducer(undefined, setTransactionType('income'))
    expect(state.transactionType).toBe('income')
    state = transactionTypeReducer(state, setTransactionType('expense'))
    expect(state.transactionType).toBe('expense')
  })

  it('setTransactionType ignores invalid string', () => {
    const state = transactionTypeReducer(
      undefined,
      setTransactionType('not-a-valid-tab')
    )
    expect(state.transactionType).toBe(DEFAULT_TAB)
  })
})

describe('transactionType selector', () => {
  it('selectTransactionType returns current tab', () => {
    const root = {
      transactionType: { transactionType: 'income' },
    } as RootState
    expect(selectTransactionType(root)).toBe('income')
  })
})
