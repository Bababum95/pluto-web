import { createContext, useCallback, useEffect, useState, type ReactNode } from 'react'
import { useMutation } from '@tanstack/react-query'

import { clearUser, selectUser, setUser, userRepository } from '@/entities/user'
import { useAppDispatch, useAppSelector } from '@/app/store'
import {
  authControllerGetProfile,
  authControllerLogin,
  authControllerRegister,
} from '@/shared/api/generated/auth/auth'
import { LOCAL_DATA_MODE } from '@/shared/lib/local-storage/config'
import { sessionRepository } from '@/shared/lib/local-storage/session-repository'
import { db } from '@/shared/lib/local-storage/db'
import { setAccessToken, removeAccessToken } from '@/shared/lib/auth/access-token'

import type {
  AuthContextValue,
  AuthResponseDto,
  LoginDto,
  RegisterDto,
} from '@/shared/lib/auth/auth-context-types'

/**
 * AuthProvider manages authentication flow and lifecycle:
 * - Login/Register/Logout operations
 * - Token management (cookie storage)
 * - Loading states for UI feedback
 * - Integration with local-first sync (when enabled)
 *
 * Architecture:
 * - User data is stored in Redux (entities/user) - single source of truth
 * - Sync metadata is stored in IndexedDB (session-repository)
 * - Access token is stored in cookie (shared/lib/auth/access-token)
 */
export const AuthContext = createContext<AuthContextValue | null>(null)

type AuthProviderProps = {
  children: ReactNode
}

type MutationPayload =
  | { path: 'register'; payload: RegisterDto }
  | { path: 'login'; payload: LoginDto }

export function AuthProvider({ children }: AuthProviderProps) {
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

    async function loadUser() {
      if (LOCAL_DATA_MODE === 'dexie') {
        const session = await sessionRepository.getCurrent()
        if (session?.currentUserId) {
          const localUser = await userRepository.getById(session.currentUserId)
          if (localUser && !cancelled) {
            dispatch(setUser(localUser))
          }
        }
      }

      try {
        const apiUser = await authControllerGetProfile()
        if (!cancelled) {
          if (LOCAL_DATA_MODE === 'dexie') {
            await userRepository.syncFromApi(apiUser)
            await sessionRepository.updateCurrentUser(apiUser.id)
          }
          dispatch(setUser(apiUser))
        }
      } catch (_error) {
        if (LOCAL_DATA_MODE === 'api-only') {
          // leave user unset on error
        }
      } finally {
        if (!cancelled) setSessionLoading(false)
      }
    }

    loadUser()

    return () => {
      cancelled = true
    }
  }, [dispatch])

  const logout = useCallback(async () => {
    removeAccessToken()
    dispatch(clearUser())

    if (LOCAL_DATA_MODE === 'dexie') {
      await userRepository.clear()
      await sessionRepository.clear()
      await db.outbox.where('entity').equals('user').delete()
    }
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

      if (LOCAL_DATA_MODE === 'dexie') {
        await userRepository.save(data.user)
        await sessionRepository.updateCurrentUser(data.user.id)
      }
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

      if (LOCAL_DATA_MODE === 'dexie') {
        await userRepository.save(data.user)
        await sessionRepository.updateCurrentUser(data.user.id)
      }
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
