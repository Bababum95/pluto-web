import type { RootState } from '@/store'

export const selectUser = (state: RootState) => state.user.user
