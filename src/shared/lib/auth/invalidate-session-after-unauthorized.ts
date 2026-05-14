import { store } from '@/app/store'
import { LOGIN_URL } from '@/shared/config/auth-routes'

import { clearClientSession } from './clear-client-session'

let redirectScheduled = false

/**
 * Clears client auth state and hard-navigates to the login page after a 401
 * on a request that included a Bearer token (session no longer valid).
 */
export function invalidateSessionAfterUnauthorizedResponse(): void {
  if (redirectScheduled) {
    return
  }
  redirectScheduled = true

  void clearClientSession(store.dispatch).finally(() => {
    window.location.assign(LOGIN_URL)
  })
}

/** @internal Vitest only — module-level guard persists across tests. */
export function resetUnauthorizedRedirectGuardForTests(): void {
  redirectScheduled = false
}
