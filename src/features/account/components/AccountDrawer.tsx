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
  FieldDescription,
} from '@/components/ui/field'
import { Icon } from '@/components/ui/icon'
import { Balance } from '@/features/money'
import { useTranslation } from '@/lib/i18n'
import { useAppSelector } from '@/store'
import { selectAccounts } from '@/store/slices/account'

type Props = {
  open: boolean
  onClose: () => void
  value?: string
  onChange: (value: string) => void
}

export const AccountDrawer: FC<Props> = ({
  open,
  onClose,
  value,
  onChange,
}) => {
  const { t } = useTranslation()
  const accounts = useAppSelector(selectAccounts)

  const handleOpenChange = (open: boolean) => {
    if (!open) onClose()
  }

  const handleChange = (value: string) => {
    onChange(value)
    onClose()
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange} modal={true}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{t('accounts.select.title')}</DrawerTitle>
          <DrawerDescription>
            {t('accounts.select.description')}
          </DrawerDescription>
        </DrawerHeader>
        <RadioGroup
          className="px-4 gap-1 overflow-y-auto pb-4"
          value={value}
          onValueChange={handleChange}
        >
          {accounts.map((account) => (
            <FieldLabel htmlFor={account.id} key={account.id}>
              <Field orientation="horizontal">
                <Icon name={account.icon} color={account.color} />
                <FieldContent className="gap-0">
                  <FieldTitle>{account.name}</FieldTitle>
                  <FieldDescription>
                    <Balance
                      balance={account.balance.original.value}
                      currency={account.balance.original.currency}
                    />
                  </FieldDescription>
                </FieldContent>
                <RadioGroupItem value={account.id} id={account.id} />
              </Field>
            </FieldLabel>
          ))}
        </RadioGroup>
      </DrawerContent>
    </Drawer>
  )
}
