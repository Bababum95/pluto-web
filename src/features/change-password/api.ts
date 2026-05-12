import { usersControllerChangePassword } from '@/lib/api/generated/users/users'

import type { UserDto } from '@/entities/user'

type ChangePasswordParams = {
  currentPassword: string
  newPassword: string
}

export const changePasswordApi = {
  changePassword: (
    userId: string,
    data: ChangePasswordParams
  ): Promise<UserDto> => usersControllerChangePassword(userId, data),
}
