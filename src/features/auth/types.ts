export type LoginParams = {
  email: string
  password: string
}

export type RegisterParams = {
  email: string
  password: string
  confirmPassword: string
}

export type AuthContext = {
  isAuthenticated: boolean
  login: (params: LoginParams) => Promise<void>
  register: (params: RegisterParams) => Promise<void>
  logout: () => Promise<void>
  user: string | null
}
