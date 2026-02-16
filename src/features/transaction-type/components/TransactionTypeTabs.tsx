import { AnimatePresence, motion } from 'motion/react'
import type { FC, ReactNode } from 'react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTranslation } from '@/lib/i18n'
import { useAppDispatch, useAppSelector } from '@/store'
import {
  setTransactionType,
  selectTransactionType,
} from '@/store/slices/transaction-type'

import { TABS } from '../constants'

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
      <motion.div
        layout
        layoutDependency={transactionType}
        className="pb-12 flex flex-col flex-1"
      >
        <AnimatePresence mode="wait" initial={false}>
          {TABS.map((tab) => {
            if (transactionType !== tab) return null

            return (
              <TabsContent key={tab} value={tab} asChild forceMount>
                <motion.div
                  className="flex-1 flex flex-col"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                >
                  {children}
                </motion.div>
              </TabsContent>
            )
          })}
        </AnimatePresence>
      </motion.div>

      <TabsList className="w-full h-12 rounded-none border-0 bg-background fixed bottom-safe left-0 right-0 z-50 border-t">
        {TABS.map((tab) => (
          <TabsTrigger key={tab} value={tab} className="flex-1 text-base">
            {t(`transactionType.${tab}`)}
          </TabsTrigger>
        ))}
      </TabsList>
      <div className="w-full pb-safe bg-background fixed left-0 right-0 bottom-0" />
    </Tabs>
  )
}
