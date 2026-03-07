import { useMutation } from '@tanstack/react-query'
import { startAuthentication } from '@simplewebauthn/browser'

import { setAccessToken } from '@/features/auth/utils/auth-token'
import { setUser } from '@/store/slices/user'
import { useAppDispatch } from '@/store'
import { ApiError } from '@/lib/api'

import { fetchLoginOptions, verifyLogin } from '../api'
import type { AuthResponse } from '../types'

type UsePasskeyLoginOptions = {
  onSuccess?: (data: AuthResponse) => void
  onError?: (error: unknown) => void
  /** Use conditional UI / autofill mediation */
  useBrowserAutofill?: boolean
}

export function usePasskeyLogin({ onSuccess, onError, useBrowserAutofill = false }: UsePasskeyLoginOptions = {}) {
  const dispatch = useAppDispatch()

  const mutation = useMutation({
    mutationFn: async (email: string) => {
      const options = await fetchLoginOptions(email)
      const credential = await startAuthentication({
        optionsJSON: options,
        useBrowserAutofill,
      })
      return verifyLogin({ credential: JSON.stringify(credential) })
    },
    onSuccess: (data) => {
      setAccessToken(data.accessToken)
      dispatch(setUser(data.user))
      onSuccess?.(data)
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        onError?.(error)
        return
      }
      // User cancelled gesture — silently ignore
      const msg = error instanceof Error ? error.message : String(error)
      if (!msg.toLowerCase().includes('cancel') && !msg.toLowerCase().includes('abort')) {
        onError?.(error)
      }
    },
  })

  return {
    login: (email: string) => mutation.mutateAsync(email),
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    reset: mutation.reset,
  }
}
