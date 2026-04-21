import { BloodIcon, AiMagicIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useContext } from 'react'
import type { FC } from 'react'

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldTitle,
} from '@/components/ui/field'
import { useTranslation } from '@/lib/i18n'

import { APPEARANCES } from '../constants'
import { AppearanceContext } from '../AppearanceContext'
import type { Appearance } from '../types'

const appearanceIcons: Record<Appearance, typeof BloodIcon> = {
  classic: AiMagicIcon,
  liquid: BloodIcon,
}

type Props = {
  open: boolean
  onClose: () => void
}

export const AppearanceDrawer: FC<Props> = ({ open, onClose }) => {
  const { t } = useTranslation()
  const ctx = useContext(AppearanceContext)

  const handleOpenChange = (open: boolean) => {
    if (!open) onClose()
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange} modal={true}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{t('settings.appearance.title')}</DrawerTitle>
          <DrawerDescription>
            {t('settings.appearance.description')}
          </DrawerDescription>
        </DrawerHeader>
        <RadioGroup
          className="px-4 gap-2 overflow-y-auto pb-4"
          value={ctx?.appearance}
          onValueChange={(value) => {
            ctx?.setAppearance(value as Appearance)
            onClose()
          }}
        >
          {APPEARANCES.map((option) => (
            <FieldLabel htmlFor={option} key={option}>
              <Field orientation="horizontal">
                <HugeiconsIcon
                  icon={appearanceIcons[option]}
                  className="size-4 mt-0.5"
                />
                <FieldContent className="gap-0">
                  <FieldTitle>{t(`settings.appearance.${option}`)}</FieldTitle>
                </FieldContent>
                <RadioGroupItem value={option} id={option} />
              </Field>
            </FieldLabel>
          ))}
        </RadioGroup>
      </DrawerContent>
    </Drawer>
  )
}
