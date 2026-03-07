import { useState } from 'react'
import { FaceIdIcon, Delete02Icon, AddSquareIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from '@/components/ui/item'
import { Spinner } from '@/components/ui/spinner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { useTranslation } from '@/lib/i18n'

import { usePasskeys } from '../hooks/use-passkeys'
import { usePasskeyRegistration } from '../hooks/use-passkey-registration'

export function PasskeySettings() {
  const { t } = useTranslation()
  const { passkeys, isLoading, remove, isDeleting } = usePasskeys()
  const { register, isPending: isRegistering } = usePasskeyRegistration()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleAddPasskey = async () => {
    try {
      const deviceName = getDeviceName()
      await register(deviceName)
    } catch {
      // Error handled in hook
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteId) return
    try {
      await remove(deleteId)
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <>
      <Card size="sm" className="py-1!">
        <ItemGroup>
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Spinner />
            </div>
          ) : passkeys.length === 0 ? (
            <Item size="sm">
              <ItemMedia variant="icon">
                <HugeiconsIcon icon={FaceIdIcon} />
              </ItemMedia>
              <ItemContent className="gap-0">
                <ItemTitle>{t('passkey.settings.noPasskeys')}</ItemTitle>
                <ItemDescription>{t('passkey.settings.noPasskeysDescription')}</ItemDescription>
              </ItemContent>
            </Item>
          ) : (
            passkeys.map((passkey, i) => (
              <div key={passkey.id}>
                {i > 0 && <ItemSeparator />}
                <Item size="sm">
                  <ItemMedia variant="icon">
                    <HugeiconsIcon icon={FaceIdIcon} />
                  </ItemMedia>
                  <ItemContent className="gap-0">
                    <ItemTitle>{passkey.deviceName}</ItemTitle>
                    <ItemDescription>
                      {passkey.lastUsedAt
                        ? t('passkey.settings.lastUsed', {
                            date: new Date(passkey.lastUsedAt).toLocaleDateString(),
                          })
                        : t('passkey.settings.neverUsed')}
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(passkey.id)}
                      disabled={isDeleting}
                      className="text-destructive hover:text-destructive"
                    >
                      <HugeiconsIcon icon={Delete02Icon} size={18} />
                    </Button>
                  </ItemActions>
                </Item>
              </div>
            ))
          )}
          <ItemSeparator />
          <Item
            size="sm"
            className="cursor-pointer hover:bg-muted/50"
            onClick={handleAddPasskey}
          >
            <ItemMedia variant="icon">
              <HugeiconsIcon icon={AddSquareIcon} />
            </ItemMedia>
            <ItemContent className="gap-0">
              <ItemTitle>
                {isRegistering ? (
                  <span className="flex items-center gap-2">
                    <Spinner className="size-3.5" />
                    {t('passkey.settings.adding')}
                  </span>
                ) : (
                  t('passkey.settings.addPasskey')
                )}
              </ItemTitle>
            </ItemContent>
          </Item>
        </ItemGroup>
      </Card>

      <Dialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('passkey.settings.deleteConfirm.title')}</DialogTitle>
            <DialogDescription>
              {t('passkey.settings.deleteConfirm.description')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter showCloseButton>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleConfirmDelete}
              isLoading={isDeleting}
            >
              {t('passkey.settings.deleteConfirm.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
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
