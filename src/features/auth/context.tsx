import { createContext, useState, useCallback } from 'react'

import { sleep } from '@/lib/utils'

import { getStoredUser, setStoredUser } from './utils'
import type { AuthContext as AuthContextType, LoginParams } from './types'

export const AuthContext = createContext<AuthContextType | null>(null)

type AuthProviderProps = {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<string | null>(() => getStoredUser())
  const isAuthenticated = !!user

  const logout = useCallback(async () => {
    await sleep(250)

    setStoredUser(null)
    setUser(null)
  }, [])

  const login = useCallback(async ({ email }: LoginParams) => {
    await sleep(500)

    setStoredUser(email)
    setUser(email)
  }, [])

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
