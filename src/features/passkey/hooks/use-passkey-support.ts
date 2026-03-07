import { useState, useEffect } from 'react'
import {
  browserSupportsWebAuthn,
  browserSupportsWebAuthnAutofill,
  platformAuthenticatorIsAvailable,
} from '@simplewebauthn/browser'

type PasskeySupport = {
  /** Full WebAuthn API support */
  supported: boolean
  /** Platform authenticator available (Face ID, Touch ID, Windows Hello) */
  platformAvailable: boolean
  /** Conditional UI (autofill) support */
  autofillSupported: boolean
  loading: boolean
}

const NOT_SUPPORTED_STATE: PasskeySupport = {
  supported: false,
  platformAvailable: false,
  autofillSupported: false,
  loading: false,
}

export function usePasskeySupport(): PasskeySupport {
  const [state, setState] = useState<PasskeySupport>(() =>
    browserSupportsWebAuthn()
      ? {
          supported: true,
          platformAvailable: false,
          autofillSupported: false,
          loading: true,
        }
      : NOT_SUPPORTED_STATE
  )

  useEffect(() => {
    if (!browserSupportsWebAuthn()) return

    let cancelled = false
    Promise.all([
      platformAuthenticatorIsAvailable(),
      browserSupportsWebAuthnAutofill(),
    ])
      .then(([platformAvailable, autofillSupported]) => {
        if (!cancelled) {
          setState({
            supported: true,
            platformAvailable,
            autofillSupported,
            loading: false,
          })
        }
      })
      .catch(() => {
        if (!cancelled) {
          setState({
            supported: true,
            platformAvailable: false,
            autofillSupported: false,
            loading: false,
          })
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  return state
}
