import { apiFetch } from '@/lib/api'

import type {
  RegisterOptions,
  LoginOptions,
  VerifyRegistrationParams,
  VerifyLoginParams,
  AuthResponse,
  PasskeyList,
  PasskeyItem,
} from './types'

const BASE = '/auth/webauthn'

export function fetchRegisterOptions(): Promise<RegisterOptions> {
  return apiFetch(`${BASE}/register-options`)
}

export function verifyRegistration(params: VerifyRegistrationParams): Promise<PasskeyItem> {
  return apiFetch(`${BASE}/verify-registration`, {
    method: 'POST',
    body: JSON.stringify(params),
  })
}

export function fetchLoginOptions(email: string): Promise<LoginOptions> {
  return apiFetch(`${BASE}/login-options`, {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export function verifyLogin(params: VerifyLoginParams): Promise<AuthResponse> {
  return apiFetch(`${BASE}/verify-login`, {
    method: 'POST',
    body: JSON.stringify(params),
  })
}

export function fetchPasskeys(): Promise<PasskeyList> {
  return apiFetch(`${BASE}/passkeys`)
}

export function deletePasskey(id: string): Promise<void> {
  return apiFetch(`${BASE}/passkeys/${id}`, { method: 'DELETE' })
}
