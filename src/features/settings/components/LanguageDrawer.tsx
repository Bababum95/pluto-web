import type { FC } from 'react'

import { SUPPORTED_LANGUAGES } from '@/lib/i18n/config'
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

type Props = {
  open: boolean
  onClose: () => void
}

export const LanguageDrawer: FC<Props> = ({ open, onClose }) => {
  const { t, i18n } = useTranslation()

  const handleOpenChange = (open: boolean) => {
    if (!open) onClose()
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange} modal={true}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{t('settings.language.title')}</DrawerTitle>
          <DrawerDescription>
            {t('settings.language.description')}
          </DrawerDescription>
        </DrawerHeader>
        <RadioGroup
          className="px-4 gap-2 overflow-y-auto pb-4"
          value={i18n.language}
          onValueChange={(value) => {
            i18n.changeLanguage(value)
            onClose()
          }}
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <FieldLabel htmlFor={lang} key={lang}>
              <Field orientation="horizontal">
                <FieldContent className="gap-0">
                  <FieldTitle>{t(`language.${lang}`)}</FieldTitle>
                </FieldContent>
                <RadioGroupItem value={lang} id={lang} />
              </Field>
            </FieldLabel>
          ))}
        </RadioGroup>
      </DrawerContent>
    </Drawer>
  )
}
