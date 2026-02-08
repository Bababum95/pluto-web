import type { components } from '@/lib/api/types'

export type LoginParams = components['schemas']['LoginDto']
export type RegisterParams = components['schemas']['RegisterDto']
export type AuthResponse = components['schemas']['AuthResponseDto']

export type AuthContext = {
  isAuth: boolean
  sessionLoading: boolean
  login: (params: LoginParams) => Promise<void>
  register: (params: RegisterParams) => Promise<void>
  logout: () => Promise<void>
  loading: boolean
}
