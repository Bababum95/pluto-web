import { apiFetch } from '@/lib/api'

import type { User } from './types'

type ChangePasswordParams = {
  currentPassword: string
  newPassword: string
}

export const userApi = {
  changePassword: (userId: string, data: ChangePasswordParams): Promise<User> =>
    apiFetch(`/users/${userId}/password`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
}
