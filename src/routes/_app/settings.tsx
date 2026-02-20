import { createFileRoute } from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Globe02Icon,
  Moon02Icon,
  UnfoldMoreIcon,
} from '@hugeicons/core-free-icons'
import { useState } from 'react'

import { Card } from '@/components/ui/card'
import { AppLayout } from '@/components/AppLayout'
import { useTranslation } from '@/lib/i18n'
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
import { ThemeDrawer, useTheme } from '@/features/theme'
import { LanguageDrawer } from '@/components/LanguageDrawer'

export const Route = createFileRoute('/_app/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState<'language' | 'theme' | null>(
    null
  )
  const { t, i18n } = useTranslation()
  const { theme } = useTheme()

  const handleCloseDrawer = () => {
    setIsDrawerOpen(null)
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
                {t(`language.${i18n.language}`)}
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
    </AppLayout>
  )
}
