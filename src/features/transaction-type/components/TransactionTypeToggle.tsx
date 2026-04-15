import type { FC } from 'react'

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useTranslation } from '@/lib/i18n'
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
      className="w-full border-border border p-0.5"
    >
      {TRANSACTION_TYPES.map((item) => (
        <ToggleGroupItem
          key={item}
          value={item}
          className="flex-1 text-base"
          onClick={() => handleChange(item)}
        >
          {t(`transactions.types.${item}`)}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
