import { describe, it, expect, beforeEach } from 'vitest'

import {
  setAccessToken,
  getAccessToken,
  removeAccessToken,
} from './auth-token'
import { TOKEN_COOKIE_NAME } from '../constants'

describe('auth-token', () => {
  beforeEach(() => {
    document.cookie = `${TOKEN_COOKIE_NAME}=; path=/; max-age=0`
  })

  it('getAccessToken returns null when no cookie is set', () => {
    expect(getAccessToken()).toBeNull()
  })

  it('setAccessToken and getAccessToken round-trip', () => {
    setAccessToken('my-token-123')
    expect(getAccessToken()).toBe('my-token-123')
  })

  it('removeAccessToken clears cookie so getAccessToken returns null', () => {
    setAccessToken('token')
    expect(getAccessToken()).toBe('token')
    removeAccessToken()
    expect(getAccessToken()).toBeNull()
  })

  it('encodes and decodes special characters in token', () => {
    const token = 'a+b=c&d=e;f'
    setAccessToken(token)
    expect(getAccessToken()).toBe(token)
  })

  it('handles token with spaces', () => {
    const token = 'token with spaces'
    setAccessToken(token)
    expect(getAccessToken()).toBe(token)
  })

  it('returns null when cookie value fails decode', () => {
    document.cookie = `${TOKEN_COOKIE_NAME}=%XX; path=/`
    expect(getAccessToken()).toBeNull()
  })
})
