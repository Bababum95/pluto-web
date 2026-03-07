import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { useTranslation } from '@/lib/i18n'

import { PasskeySettings } from './PasskeySettings'

type PasskeyDrawerProps = {
  open: boolean
  onClose: () => void
}

export function PasskeyDrawer({ open, onClose }: PasskeyDrawerProps) {
  const { t } = useTranslation()

  return (
    <Drawer open={open} onOpenChange={(v) => !v && onClose()} modal={true}>
      <DrawerContent className="pb-safe">
        <DrawerHeader>
          <DrawerTitle>{t('passkey.settings.title')}</DrawerTitle>
          <DrawerDescription>{t('passkey.settings.description')}</DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-4 flex flex-col gap-3 overflow-y-auto">
          <PasskeySettings />
        </div>
      </DrawerContent>
    </Drawer>
  )
}
