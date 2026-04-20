import type { FC, ReactNode } from 'react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTranslation } from '@/lib/i18n'
import { useAppDispatch, useAppSelector } from '@/store'
import {
  setTransactionType,
  selectTransactionType,
} from '@/store/slices/transaction-type'

import { TRANSACTION_TYPES } from '../constants'

type Props = {
  children: ReactNode
}

export const TransactionTypeTabs: FC<Props> = ({ children }) => {
  const { t } = useTranslation()
  const transactionType = useAppSelector(selectTransactionType)
  const dispatch = useAppDispatch()

  const handleTabChange = (tab: string) => {
    dispatch(setTransactionType(tab))
  }

  return (
    <Tabs
      value={transactionType}
      onValueChange={handleTabChange}
      className="flex-1"
    >
      {TRANSACTION_TYPES.map((tab) => (
        <TabsContent key={tab} value={tab}>
          {children}
        </TabsContent>
      ))}

      <TabsList className="w-[calc(100%-32px)] h-12 fixed bottom-4 left-4 right-4 z-50 border border-border/60 backdrop-blur-lg bg-transparent rounded-3xl">
        {TRANSACTION_TYPES.map((tab) => (
          <TabsTrigger
            key={tab}
            value={tab}
            className="flex-1 text-base rounded-2xl"
          >
            {t(`transactions.types.${tab}`)}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
