import { createFileRoute } from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Globe02Icon,
  Moon02Icon,
  UnfoldMoreIcon,
  Briefcase06Icon,
} from '@hugeicons/core-free-icons'
import { useState } from 'react'

import { Card } from '@/components/ui/card'
import { AppLayout } from '@/components/AppLayout'
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
import { LanguageDrawer } from '@/components/LanguageDrawer'
import { ThemeDrawer, useTheme } from '@/features/theme'
import { AccountDrawer } from '@/features/account'
import { useTranslation } from '@/lib/i18n'
import { selectDefaultAccount } from '@/store/slices/settings/selectors'
import { useAppDispatch, useAppSelector } from '@/store'
import { setDefaultAccount } from '@/store/slices/settings'
import type { SupportedLanguages } from '@/lib/i18n/types'

export const Route = createFileRoute('/_app/settings')({
  component: SettingsPage,
})

type DrawerType = 'language' | 'theme' | 'account'

function SettingsPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState<DrawerType | null>(null)
  const { t, i18n } = useTranslation()
  const { theme } = useTheme()
  const defaultAccount = useAppSelector(selectDefaultAccount)
  const dispatch = useAppDispatch()
  const handleCloseDrawer = () => {
    setIsDrawerOpen(null)
  }
  const handleChangeAccount = (id: string) => {
    dispatch(setDefaultAccount(id))
  }
  return (
    <AppLayout title={t('settings.title')}>
      <Card size="sm" className="py-1!">
        <ItemGroup>
          <Item size="sm" onClick={() => setIsDrawerOpen('language')}>
            <ItemMedia variant="icon">
              <HugeiconsIcon icon={Globe02Icon} />
            </ItemMedia>
            <ItemContent className="gap-0">
              <ItemTitle>{t('settings.language.title')}</ItemTitle>
              <ItemDescription className="text-primary">
                {t(`language.${i18n.language as SupportedLanguages}`)}
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <HugeiconsIcon size={20} icon={UnfoldMoreIcon} />
            </ItemActions>
          </Item>
          <ItemSeparator />
          <Item size="sm" onClick={() => setIsDrawerOpen('theme')}>
            <ItemMedia variant="icon">
              <HugeiconsIcon icon={Moon02Icon} />
            </ItemMedia>
            <ItemContent className="gap-0">
              <ItemTitle>{t('settings.theme.title')}</ItemTitle>
              <ItemDescription className="text-primary">
                {t(`settings.theme.${theme}`)}
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <HugeiconsIcon size={20} icon={UnfoldMoreIcon} />
            </ItemActions>
          </Item>
          <ItemSeparator />
          <Item size="sm" onClick={() => setIsDrawerOpen('account')}>
            <ItemMedia variant="icon">
              <HugeiconsIcon icon={Briefcase06Icon} />
            </ItemMedia>
            <ItemContent className="gap-0">
              <ItemTitle>{t('settings.account.title')}</ItemTitle>
              <ItemDescription className="text-primary">
                {defaultAccount
                  ? defaultAccount.name
                  : t('settings.account.none')}
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <HugeiconsIcon size={20} icon={UnfoldMoreIcon} />
            </ItemActions>
          </Item>
        </ItemGroup>
      </Card>

      <LanguageDrawer
        open={isDrawerOpen === 'language'}
        onClose={handleCloseDrawer}
      />
      <ThemeDrawer
        open={isDrawerOpen === 'theme'}
        onClose={handleCloseDrawer}
      />
      <AccountDrawer
        open={isDrawerOpen === 'account'}
        onClose={handleCloseDrawer}
        value={defaultAccount?.id}
        onChange={handleChangeAccount}
      />
    </AppLayout>
  )
}
