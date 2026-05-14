import Decimal from 'decimal.js'
import { useMemo, type FC } from 'react'

import { Field, FieldLabel } from '@/shared/ui/field'
import { Input, type InputProps } from '@/shared/ui/input'
import { sanitizeDecimal } from '@/shared/lib/money/utils/sanitizeDecimal'
import { DEFAULT_CURRENCY } from '@/shared/lib/money/constants'
import { stringIsValid } from '@/shared/lib'
import { selectAccounts } from '@/entities/account'
import { selectExchangeRates } from '@/entities/exchange-rate'
import { useAppSelector } from '@/app/store/hooks'
import type { AccountDto } from '@/entities/account'

import { calculateTransferRate } from '../../lib/calculateTransferRate'
import type { FeeType } from '../../types'

type Props = Omit<InputProps, 'onChange'> & {
  label: string
  onChange: (value: string) => void
  fromAmount?: string | null
  toAmount?: string | null
  fee?: string | null
  feeType: FeeType
  fromAccount: string
  toAccount: string
}

const getCurrencyCode = (accounts: AccountDto[], account: string): string => {
  return (
    accounts.find((acc) => acc.id === account)?.balance.original.currency
      ?.code ?? DEFAULT_CURRENCY.code
  )
}

export const RateField: FC<Props> = ({
  label,
  onChange,
  value,
  fromAccount,
  toAccount,
  fee,
  fromAmount,
  toAmount,
  feeType,
  ...props
}) => {
  const rates = useAppSelector(selectExchangeRates)
  const accounts = useAppSelector(selectAccounts)

  const placeholder = useMemo<string>(() => {
    if (stringIsValid(value)) return value as string

    const feeDecimal = fee ? new Decimal(fee) : null
    const fromDecimal = fromAmount ? new Decimal(fromAmount) : null
    const toDecimal = toAmount ? new Decimal(toAmount) : null

    const rate = calculateTransferRate({
      rates,
      from: {
        value: fromDecimal,
        code: getCurrencyCode(accounts, fromAccount),
      },
      to: {
        value: toDecimal,
        code: getCurrencyCode(accounts, toAccount),
      },
      fee: {
        value: feeDecimal,
        type: feeType,
      },
    })

    if (!rate) return '1'

    return rate.toString().slice(0, 12)
  }, [
    value,
    fee,
    fromAmount,
    toAmount,
    fromAccount,
    toAccount,
    feeType,
    rates,
    accounts,
  ])

  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <Input
        type="text"
        inputMode="decimal"
        placeholder={placeholder}
        size="sm"
        onChange={(evt) => onChange(sanitizeDecimal(evt.target.value))}
        value={value}
        {...props}
      />
    </Field>
  )
}
