import type { PublicKeyCredentialCreationOptionsJSON, PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/browser'

export type PasskeyItem = {
  id: string
  deviceName: string
  deviceType: string
  createdAt: string
  lastUsedAt: string | null
}

export type PasskeyList = {
  passkeys: PasskeyItem[]
}

export type RegisterOptions = PublicKeyCredentialCreationOptionsJSON

export type LoginOptions = PublicKeyCredentialRequestOptionsJSON

export type VerifyRegistrationParams = {
  credential: string
  deviceName?: string
}

export type VerifyLoginParams = {
  credential: string
}

export type AuthResponse = {
  user: {
    id: string
    email: string
    name: string
    createdAt: string
    updatedAt: string
  }
  accessToken: string
}

/** localStorage key to mark that user has registered a passkey on this device */
export const PASSKEY_REGISTERED_KEY = 'pluto_passkey_registered'
