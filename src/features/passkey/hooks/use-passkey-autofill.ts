import { useEffect, useRef } from 'react'
import { startAuthentication } from '@simplewebauthn/browser'
import { toast } from 'sonner'

import { setAccessToken } from '@/features/auth/utils/auth-token'
import { setUser } from '@/store/slices/user'
import { useAppDispatch } from '@/store'
import { ApiError } from '@/lib/api'

import { fetchLoginOptions, verifyLogin } from '../api'
import { PASSKEY_REGISTERED_KEY } from '../types'

type UsePasskeyAutofillOptions = {
  autofillSupported: boolean
  onSuccess: () => void
}

/**
 * Initiates WebAuthn conditional UI (autofill) for passkey login.
 * This allows the browser to show a passkey suggestion in the email input autocomplete.
 * Requires autoComplete="username webauthn" on the email input.
 * Only runs when browser supports conditional mediation and user has previously registered a passkey.
 */
export function usePasskeyAutofill({ autofillSupported, onSuccess }: UsePasskeyAutofillOptions) {
  const dispatch = useAppDispatch()
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!autofillSupported) return
    if (!localStorage.getItem(PASSKEY_REGISTERED_KEY)) return

    const abortController = new AbortController()
    abortControllerRef.current = abortController

    const run = async () => {
      try {
        // For conditional UI we need options — use empty email to get discoverable credential options
        // The server will return options without allowCredentials restriction
        const options = await fetchLoginOptions('').catch(() => null)
        if (!options || abortController.signal.aborted) return

        const credential = await startAuthentication({
          optionsJSON: options,
          useBrowserAutofill: true,
        })

        if (abortController.signal.aborted) return

        const data = await verifyLogin({ credential: JSON.stringify(credential) })
        setAccessToken(data.accessToken)
        dispatch(setUser(data.user))
        onSuccess()
      } catch (error) {
        if (abortController.signal.aborted) return
        if (error instanceof ApiError) return
        const msg = error instanceof Error ? error.message : String(error)
        if (msg.toLowerCase().includes('cancel') || msg.toLowerCase().includes('abort')) return
        toast.error('Biometric login failed')
      }
    }

    run()

    return () => {
      abortController.abort()
    }
  }, [autofillSupported, dispatch, onSuccess])

  const abort = () => {
    abortControllerRef.current?.abort()
  }

  return { abort }
}
