import { createContext, useCallback, useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'

import { clearUser, selectUser, setUser } from '@/store/slices/user'
import { useAppDispatch, useAppSelector } from '@/store'
import {
  authControllerGetProfile,
  authControllerLogin,
  authControllerRegister,
} from '@/lib/api/generated/auth/auth'

import type {
  AuthContext as AuthContextType,
  AuthResponseDto,
  LoginDto,
  RegisterDto,
} from './types'
import { setAccessToken, removeAccessToken } from './utils/auth-token'

export const AuthContext = createContext<AuthContextType | null>(null)

type Props = {
  children: React.ReactNode
}

type MutationPayload =
  | { path: 'register'; payload: RegisterDto }
  | { path: 'login'; payload: LoginDto }

export function AuthProvider({ children }: Props) {
  const [sessionLoading, setSessionLoading] = useState(true)
  const mutation = useMutation({
    mutationFn: async ({
      path,
      payload,
    }: MutationPayload): Promise<AuthResponseDto> => {
      if (path === 'login') {
        return authControllerLogin(payload)
      }
      const registered = await authControllerRegister(payload)
      if (!registered) {
        throw new Error('Register returned empty response')
      }
      return registered
    },
  })
  const user = useAppSelector(selectUser)
  const dispatch = useAppDispatch()

  useEffect(() => {
    let cancelled = false

    authControllerGetProfile()
      .then((data) => {
        if (!cancelled) dispatch(setUser(data))
      })
      .catch(() => {
        // Session invalid or unauthenticated; leave user unset
      })
      .finally(() => {
        if (!cancelled) setSessionLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [dispatch, sessionLoading])

  const logout = useCallback(async () => {
    removeAccessToken()
    dispatch(clearUser())
  }, [dispatch])

  const login = useCallback(
    async (payload: LoginDto) => {
      mutation.reset()
      const data = (await mutation.mutateAsync({
        path: 'login',
        payload,
      })) as AuthResponseDto
      setAccessToken(data.accessToken)
      dispatch(setUser(data.user))
    },
    [mutation, dispatch]
  )

  const register = useCallback(
    async (payload: RegisterDto) => {
      mutation.reset()
      const data = (await mutation.mutateAsync({
        path: 'register',
        payload,
      })) as AuthResponseDto
      setAccessToken(data.accessToken)
      dispatch(setUser(data.user))
    },
    [mutation, dispatch]
  )

  return (
    <AuthContext.Provider
      value={{
        logout,
        login,
        register,
        isAuth: !!user,
        sessionLoading,
        loading: mutation.isPending,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
