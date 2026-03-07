import { FaceIdIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n'

type PasskeyLoginButtonProps = {
  email: string
  onLogin: (email: string) => Promise<unknown>
  isPending: boolean
}

export function PasskeyLoginButton({ email, onLogin, isPending }: PasskeyLoginButtonProps) {
  const { t } = useTranslation()

  const handleClick = () => {
    if (!email) return
    onLogin(email)
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full gap-2"
      onClick={handleClick}
      isLoading={isPending}
      disabled={isPending || !email}
    >
      {!isPending && <HugeiconsIcon icon={FaceIdIcon} size={20} />}
      {t('passkey.loginButton')}
    </Button>
  )
}
