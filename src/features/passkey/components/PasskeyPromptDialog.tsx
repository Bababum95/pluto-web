import { useState } from 'react'
import { FaceIdIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { useTranslation } from '@/lib/i18n'

import { usePasskeyRegistration } from '../hooks/use-passkey-registration'

type PasskeyPromptDialogProps = {
  open: boolean
  onClose: () => void
}

export function PasskeyPromptDialog({ open, onClose }: PasskeyPromptDialogProps) {
  const { t } = useTranslation()
  const { register, isPending } = usePasskeyRegistration()
  const [done, setDone] = useState(false)

  const handleEnable = async () => {
    try {
      const deviceName = getDeviceName()
      await register(deviceName)
      setDone(true)
      setTimeout(onClose, 1500)
    } catch {
      // Error handled in hook
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent showCloseButton={!isPending}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-primary/10 text-primary rounded-lg p-2">
              <HugeiconsIcon icon={FaceIdIcon} size={24} />
            </div>
            <DialogTitle>{t('passkey.prompt.title')}</DialogTitle>
          </div>
          <DialogDescription>{t('passkey.prompt.description')}</DialogDescription>
        </DialogHeader>

        {done ? (
          <p className="text-center text-sm text-primary font-medium py-2">
            {t('passkey.registration.success')}
          </p>
        ) : (
          <DialogFooter showCloseButton>
            <Button
              className="flex-1"
              onClick={handleEnable}
              isLoading={isPending}
              disabled={isPending}
            >
              {t('passkey.prompt.enable')}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

function getDeviceName(): string {
  const ua = navigator.userAgent
  if (/iPhone/i.test(ua)) return 'iPhone'
  if (/iPad/i.test(ua)) return 'iPad'
  if (/Android/i.test(ua)) return 'Android'
  if (/Mac/i.test(ua)) return 'Mac'
  if (/Windows/i.test(ua)) return 'Windows'
  return 'Unknown device'
}
