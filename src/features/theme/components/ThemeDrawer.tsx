import { Sun02Icon, Moon02Icon, ComputerIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import type { FC } from 'react'

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useTranslation } from '@/lib/i18n'
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldTitle,
} from '@/components/ui/field'

import type { Theme } from '../types'
import { useTheme } from '../hooks/useTheme'

type Props = {
  open: boolean
  onClose: () => void
}

type ThemeOption = {
  value: Theme
  icon: typeof Sun02Icon
}

const themes: ThemeOption[] = [
  { value: 'light', icon: Sun02Icon },
  { value: 'dark', icon: Moon02Icon },
  { value: 'system', icon: ComputerIcon },
]

export const ThemeDrawer: FC<Props> = ({ open, onClose }) => {
  const { t } = useTranslation()
  const { theme, setTheme } = useTheme()

  const handleOpenChange = (open: boolean) => {
    if (!open) onClose()
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange} modal={true}>
      <DrawerContent className="pb-safe">
        <DrawerHeader>
          <DrawerTitle>{t('settings.theme.title')}</DrawerTitle>
          <DrawerDescription>
            {t('settings.theme.description')}
          </DrawerDescription>
        </DrawerHeader>
        <RadioGroup
          className="px-4 gap-2 overflow-y-auto pb-4"
          value={theme}
          onValueChange={(value) => {
            setTheme(value as Theme)
            onClose()
          }}
        >
          {themes.map((themeOption) => (
            <FieldLabel htmlFor={themeOption.value} key={themeOption.value}>
              <Field orientation="horizontal">
                <HugeiconsIcon
                  icon={themeOption.icon}
                  className="size-4 mt-0.5"
                />
                <FieldContent className="gap-0">
                  <FieldTitle>
                    {t(`settings.theme.${themeOption.value}`)}
                  </FieldTitle>
                </FieldContent>
                <RadioGroupItem
                  value={themeOption.value}
                  id={themeOption.value}
                />
              </Field>
            </FieldLabel>
          ))}
        </RadioGroup>
      </DrawerContent>
    </Drawer>
  )
}
