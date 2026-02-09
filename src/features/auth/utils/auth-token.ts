/**
 * Store access token in a non-httpOnly cookie so it can be read and sent as Authorization header.
 * Same options (path, maxAge, sameSite, secure) for set and delete so the cookie is cleared correctly.
 */

import { TOKEN_COOKIE_NAME, MAX_AGE_SEC } from '../constants'

export function setAccessToken(token: string): void {
  document.cookie = `${TOKEN_COOKIE_NAME}=${encodeURIComponent(token)}; path=/; max-age=${MAX_AGE_SEC}; samesite=strict; secure=true`
}

export function getAccessToken(): string | null {
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${TOKEN_COOKIE_NAME}=([^;]*)`)
  )
  if (!match) return null
  try {
    return decodeURIComponent(match[1])
  } catch {
    return null
  }
}

export function removeAccessToken(): void {
  document.cookie = `${TOKEN_COOKIE_NAME}=; path=/; max-age=0; samesite=strict; secure=true`
}
