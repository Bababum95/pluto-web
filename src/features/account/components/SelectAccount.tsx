import { UnfoldMoreIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState, type FC } from 'react'
import { useTranslation } from 'react-i18next'

import { Field, FieldError, FieldLabel } from '@/shared/ui/field'
import { Button } from '@/shared/ui/button'
import { selectAccountById } from '@/entities/account'
import { cn } from '@/shared/lib'
import { useAppSelector } from '@/app/store/hooks'

import { AccountCard } from './AccountCard'
import { AccountDrawer } from './AccountDrawer'

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
  const { t } = useTranslation()
  const account = useAppSelector((state) => selectAccountById(state, value))

  const handleChange = (id: string) => {
    onChange(id)
    setIsOpen(false)
  }

  return (
    <Field className="flex flex-col gap-2">
      <FieldLabel>{t('common.fields.account')}</FieldLabel>

      {account ? (
        <AccountCard
          {...account}
          onClick={() => setIsOpen(true)}
          actions={<HugeiconsIcon size={20} icon={UnfoldMoreIcon} />}
        />
      ) : (
        <Button
          variant="secondary"
          type="button"
          onClick={() => setIsOpen(true)}
          className={cn(
            'justify-between w-full',
            isError ? 'border-destructive text-destructive' : ''
          )}
        >
          {t('accounts.select.title')}
          <HugeiconsIcon size={20} icon={UnfoldMoreIcon} />
        </Button>
      )}
      {isError && <FieldError>{errorMessage}</FieldError>}

      <AccountDrawer
        open={isOpen}
        value={value}
        onClose={() => setIsOpen(false)}
        onChange={handleChange}
      />
    </Field>
  )
}
