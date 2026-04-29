import type {
  AuthResponseDto,
  LoginDto,
  RegisterDto,
} from '@/lib/api/generated/model'

export type AuthContext = {
  isAuth: boolean
  sessionLoading: boolean
  login: (params: LoginDto) => Promise<void>
  register: (params: RegisterDto) => Promise<void>
  logout: () => Promise<void>
  loading: boolean
}

export type { LoginDto, RegisterDto, AuthResponseDto }
