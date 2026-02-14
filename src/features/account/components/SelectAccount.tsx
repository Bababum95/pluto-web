import { UnfoldMoreIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState, type FC } from 'react'
import { useTranslation } from 'react-i18next'

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Icon } from '@/components/ui/icon'
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldTitle,
} from '@/components/ui/field'
import { AccountCard } from './AccountCard'
import { useAppSelector } from '@/store/hooks'
import { selectAccounts } from '@/store/slices/account'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Props = {
  value?: string
  onChange: (value: string) => void
  isError?: boolean
  errorMessage?: string
}

export const SelectAccount: FC<Props> = ({
  value,
  onChange,
  isError,
  errorMessage,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const accounts = useAppSelector(selectAccounts)
  const { t } = useTranslation()

  const account = accounts.find((acc) => acc.id === value)

  const handleChange = (id: string) => {
    onChange(id)
    setIsOpen(false)
  }

  return (
    <div className="flex flex-col gap-2">
      <span>{t('transaction.account')}</span>
      <Drawer open={isOpen} onOpenChange={setIsOpen} modal={true}>
        <DrawerTrigger asChild>
          {account ? (
            <AccountCard
              {...account}
              actions={<HugeiconsIcon size={20} icon={UnfoldMoreIcon} />}
            />
          ) : (
            <Button
              variant="outline"
              type="button"
              className={cn(
                'justify-between w-full',
                isError ? 'border-destructive text-destructive' : ''
              )}
            >
              {t('accounts.select.title')}
              <HugeiconsIcon size={20} icon={UnfoldMoreIcon} />
            </Button>
          )}
        </DrawerTrigger>
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
                      {account.balance} {account.currency.symbol}
                    </FieldDescription>
                  </FieldContent>
                  <RadioGroupItem value={account.id} id={account.id} />
                </Field>
              </FieldLabel>
            ))}
          </RadioGroup>
        </DrawerContent>
      </Drawer>
      {isError && <FieldError>{errorMessage}</FieldError>}
    </div>
  )
}
