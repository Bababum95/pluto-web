import { AppLayout } from '@/components/AppLayout'
import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { UnfoldMoreIcon, PlusSignIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { TransactionTypeTabs } from '@/features/transaction-type'
import { ButtonGroup } from '@/components/ui/button-group'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Drawer, DrawerTrigger } from '@/components/ui/drawer'
import { AccountCard } from '@/features/account'

export const Route = createFileRoute('/_app/transaction')({
  component: TransactionPage,
})

function TransactionPage() {
  const { t } = useTranslation()

  return (
    <AppLayout title={t('transaction.title')}>
      <TransactionTypeTabs>
        <div className="flex flex-col gap-4 py-4">
          <ButtonGroup className="w-full">
            <Input placeholder="0" size="lg" />
            <Button variant="outline" size="lg">
              USD
            </Button>
          </ButtonGroup>
          <div className="flex flex-col gap-2">
            <span>{t('transaction.account')}</span>
            <Drawer>
              <DrawerTrigger asChild>
                <AccountCard
                  name="USD"
                  currency="USD"
                  balance="1000"
                  iconColor="#000000"
                  icon={PlusSignIcon}
                  id="1"
                  actions={<HugeiconsIcon size={20} icon={UnfoldMoreIcon} />}
                />
              </DrawerTrigger>
            </Drawer>
          </div>
        </div>
      </TransactionTypeTabs>
    </AppLayout>
  )
}
