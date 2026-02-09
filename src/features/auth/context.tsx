import { createContext, useCallback, useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'

import { clearUser, selectUser, setUser } from '@/store/slices/user'
import { useAppDispatch, useAppSelector } from '@/store'
import { apiFetch } from '@/lib/api'
import type { User } from '@/features/user/types'

import type {
  AuthContext as AuthContextType,
  AuthResponse,
  LoginParams,
  RegisterParams,
} from './types'
import { setAccessToken, removeAccessToken } from './utils/auth-token'

export const AuthContext = createContext<AuthContextType | null>(null)

type Props = {
  children: React.ReactNode
}

type MutationPayload =
  | {
      path: 'register'
      payload: RegisterParams
    }
  | {
      path: 'login'
      payload: LoginParams
    }

export function AuthProvider({ children }: Props) {
  const [sessionLoading, setSessionLoading] = useState(true)
  const mutation = useMutation({
    mutationFn: ({ path, payload }: MutationPayload): Promise<AuthResponse> => {
      return apiFetch(`/auth/${path}`, {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    },
  })
  const user = useAppSelector(selectUser)
  const dispatch = useAppDispatch()

  useEffect(() => {
    let cancelled = false

    apiFetch<User>('/auth/me')
      .then((data) => {
        if (!cancelled) dispatch(setUser(data))
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
    async (payload: LoginParams) => {
      mutation.reset()
      const data = (await mutation.mutateAsync({
        path: 'login',
        payload,
      })) as AuthResponse
      setAccessToken(data.accessToken)
      dispatch(setUser(data.user))
    },
    [mutation, dispatch]
  )

  const register = useCallback(
    async (payload: RegisterParams) => {
      mutation.reset()
      const data = (await mutation.mutateAsync({
        path: 'register',
        payload,
      })) as AuthResponse
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
