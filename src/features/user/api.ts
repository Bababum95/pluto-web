import { usersControllerChangePassword } from '@/lib/api/generated/users/users'

import type { UserDto } from './types'

type ChangePasswordParams = {
  currentPassword: string
  newPassword: string
}

export const userApi = {
  changePassword: (
    userId: string,
    data: ChangePasswordParams
  ): Promise<UserDto> => usersControllerChangePassword(userId, data),
}
