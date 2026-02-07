import type { components } from '@/lib/api/types'

export type LoginParams = components['schemas']['LoginDto']
export type RegisterParams = components['schemas']['RegisterDto']

export type AuthContext = {
  isAuth: boolean
  /** True while GET /auth/me is in progress; use to delay routing until session is known */
  sessionLoading: boolean
  login: (params: LoginParams) => Promise<void>
  register: (params: RegisterParams) => Promise<void>
  logout: () => Promise<void>
  loading: boolean
}
