import { UnfoldMoreIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState, type FC } from 'react'
import { useTranslation } from 'react-i18next'

import { FieldError } from '@/components/ui/field'
import { AccountCard } from './AccountCard'
import { useAppSelector } from '@/store/hooks'
import { selectAccountById } from '@/store/slices/account'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

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
    <div className="flex flex-col gap-2">
      <span>{t('transaction.account')}</span>

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
    </div>
  )
}
