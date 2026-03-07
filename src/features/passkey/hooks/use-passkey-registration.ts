import { useMutation, useQueryClient } from '@tanstack/react-query'
import { startRegistration } from '@simplewebauthn/browser'
import { toast } from 'sonner'

import { useTranslation } from '@/lib/i18n'
import { ApiError } from '@/lib/api'

import { fetchRegisterOptions, verifyRegistration } from '../api'
import { PASSKEY_REGISTERED_KEY } from '../types'

export const PASSKEYS_QUERY_KEY = ['passkeys'] as const

export function usePasskeyRegistration() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (deviceName?: string) => {
      const options = await fetchRegisterOptions()
      const credential = await startRegistration({ optionsJSON: options })
      return verifyRegistration({
        credential: JSON.stringify(credential),
        deviceName,
      })
    },
    onSuccess: () => {
      localStorage.setItem(PASSKEY_REGISTERED_KEY, '1')
      queryClient.invalidateQueries({ queryKey: PASSKEYS_QUERY_KEY })
      toast.success(t('passkey.registration.success'))
    },
    onError: (error) => {
      if (error instanceof ApiError) return
      // User cancelled or device error
      const msg = error instanceof Error ? error.message : String(error)
      if (!msg.toLowerCase().includes('cancel') && !msg.toLowerCase().includes('abort')) {
        toast.error(t('passkey.errors.registrationFailed'))
      }
    },
  })

  return {
    register: (deviceName?: string) => mutation.mutateAsync(deviceName),
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
  }
}
