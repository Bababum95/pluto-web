import type { FC } from 'react'

import { ToggleGroup, ToggleGroupItem } from '@/shared/ui/toggle-group'
import { useTranslation } from '@/shared/lib/i18n'
import { useAppDispatch, useAppSelector } from '@/store'
import {
  setTransactionType,
  selectTransactionType,
} from '@/store/slices/transaction-type'

import { TRANSACTION_TYPES } from '../constants'

export const TransactionTypeToggle: FC = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const transactionType = useAppSelector(selectTransactionType)

  const handleChange = (tab: string) => {
    dispatch(setTransactionType(tab))
  }

  return (
    <ToggleGroup
      type="single"
      value={transactionType}
      spacing={1}
      className="w-full border-border border p-0.5 rounded-3xl"
    >
      {TRANSACTION_TYPES.map((item) => (
        <ToggleGroupItem
          key={item}
          value={item}
          className="flex-1 text-base rounded-2xl"
          onClick={() => handleChange(item)}
        >
          {t(`transactions.types.${item}`)}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
