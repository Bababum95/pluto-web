import { createContext, useCallback, useEffect, useState } from 'react'
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

import type {
  AuthContext as AuthContextType,
  AuthResponseDto,
  LoginDto,
  RegisterDto,
} from './types'
import { setAccessToken, removeAccessToken } from './utils/auth-token'

/**
 * AuthProvider manages authentication flow and lifecycle:
 * - Login/Register/Logout operations
 * - Token management (cookie storage)
 * - Loading states for UI feedback
 * - Integration with local-first sync (when enabled)
 *
 * Architecture:
 * - User data is stored in Redux (entities/user) - single source of truth
 * - Sync metadata is stored in IndexedDB (lib/local/session-repository)
 * - Access token is stored in cookie (features/auth/utils/auth-token)
 */
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

  // Read user from Redux - single source of truth
  const user = useAppSelector(selectUser)
  const dispatch = useAppDispatch()

  /**
   * Load user profile on mount:
   * 1. In dexie mode: load from IndexedDB first (instant UI)
   * 2. Then fetch from API and sync
   * 3. In api-only mode: only fetch from API
   */
  useEffect(() => {
    let cancelled = false

    async function loadUser() {
      if (LOCAL_DATA_MODE === 'dexie') {
        // Step 1: Load from local storage for instant UI
        const session = await sessionRepository.getCurrent()
        if (session?.currentUserId) {
          const localUser = await userRepository.getById(session.currentUserId)
          if (localUser && !cancelled) {
            dispatch(setUser(localUser))
          }
        }
      }

      // Step 2: Fetch from API and sync
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
          // Original behavior: leave user unset on error
        }
        // In dexie mode: continue with local data if API fails (offline support)
      } finally {
        if (!cancelled) setSessionLoading(false)
      }
    }

    loadUser()

    return () => {
      cancelled = true
    }
  }, [dispatch])

  /**
   * Logout: clear all auth state and local data
   * 1. Remove access token from cookie
   * 2. Clear user from Redux
   * 3. In dexie mode: clear IndexedDB (user data, session, outbox)
   */
  const logout = useCallback(async () => {
    removeAccessToken()
    dispatch(clearUser())

    if (LOCAL_DATA_MODE === 'dexie') {
      await userRepository.clear()
      await sessionRepository.clear()
      await db.outbox.where('entity').equals('user').delete()
    }
  }, [dispatch])

  /**
   * Login: authenticate and save user data
   * 1. Call login API
   * 2. Save access token to cookie
   * 3. Save user to Redux
   * 4. In dexie mode: save to IndexedDB and update session
   */
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

  /**
   * Register: create account and save user data
   * Same flow as login after successful registration
   */
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
