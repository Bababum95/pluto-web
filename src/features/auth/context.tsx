import { createContext, useCallback, useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'

import { clearUser, selectUser, setUser } from '@/store/slices/user'
import { useAppDispatch, useAppSelector } from '@/store'
import { apiFetch } from '@/lib/api'
import type { User } from '@/features/user/types'

import type {
  AuthContext as AuthContextType,
  LoginParams,
  RegisterParams,
} from './types'
import { sleep } from '@/lib/utils'

export const AuthContext = createContext<AuthContextType | null>(null)

type AuthProviderProps = {
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
  | {
      path: 'logout'
      payload?: object
    }

export function AuthProvider({ children }: AuthProviderProps) {
  const [sessionLoading, setSessionLoading] = useState(true)
  const mutation = useMutation({
    mutationFn: ({ path, payload }: MutationPayload): Promise<User> => {
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
    sleep(1000).then(() => {
      apiFetch<User>('/auth/me')
        .then((data) => {
          if (!cancelled) dispatch(setUser(data))
        })
        .finally(() => {
          if (!cancelled) setSessionLoading(false)
        })
    })
    return () => {
      cancelled = true
    }
  }, [dispatch, sessionLoading])

  const logout = useCallback(async () => {
    mutation.reset()
    await mutation.mutateAsync({ path: 'logout' })
    dispatch(clearUser())
  }, [mutation, dispatch])

  const login = useCallback(
    async (payload: LoginParams) => {
      mutation.reset()
      const data = await mutation.mutateAsync({ path: 'login', payload })
      dispatch(setUser(data))
    },
    [mutation, dispatch]
  )

  const register = useCallback(
    async (payload: RegisterParams) => {
      mutation.reset()
      const data = await mutation.mutateAsync({ path: 'register', payload })
      dispatch(setUser(data))
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
