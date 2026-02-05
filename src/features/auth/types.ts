export type LoginParams = {
  email: string
  password: string
}

export type AuthContext = {
  isAuthenticated: boolean
  login: (params: LoginParams) => Promise<void>
  logout: () => Promise<void>
  user: string | null
}
