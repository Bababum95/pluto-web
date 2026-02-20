import type { RootState } from '@/store'

export const selectAccounts = (state: RootState) => state.account.accounts
export const selectAccountById = (state: RootState, id?: string) => {
  if (!id) return null
  return state.account.accounts.find((a) => a.id === id)
}
export const selectAccountsSummary = (state: RootState) => state.account.summary
export const selectAccountsStatus = (state: RootState) => state.account.status
