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
    <Tabs value={transactionType} onValueChange={handleTabChange}>
      <motion.div layout layoutDependency={transactionType} className="pb-12">
        <AnimatePresence mode="wait" initial={false}>
          {TABS.map((tab) => {
            if (transactionType !== tab) return null

            return (
              <TabsContent key={tab} value={tab} asChild forceMount>
                <motion.div
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

      <TabsList className="w-full h-12 rounded-none border-0 bg-background fixed bottom-0 left-0 right-0 z-50 border-t">
        {TABS.map((tab) => (
          <TabsTrigger key={tab} value={tab} className="flex-1 text-base">
            {t(`transactionType.${tab}`)}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
