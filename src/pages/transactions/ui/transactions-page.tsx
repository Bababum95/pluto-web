import { useTranslation } from '@/shared/lib/i18n'
import { Link } from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import { PlusSignIcon } from '@hugeicons/core-free-icons'

import { AppLayout } from '@/components/AppLayout'
import { TransactionTypeTabs } from '@/features/transaction-type'
import { Button } from '@/shared/ui/button'
import { TransactionsList } from '@/widgets/transaction-list'

export function TransactionsPage() {
  const { t } = useTranslation()

  return (
    <AppLayout
      title={t('transactions.title')}
      backPath="/"
      showBackButton
      actions={
        <Button variant="ghost" size="icon" asChild>
          <Link
            to="/transactions/create"
            viewTransition={{ types: ['slide-left'] }}
          >
            <HugeiconsIcon icon={PlusSignIcon} />
          </Link>
        </Button>
      }
    >
      <TransactionTypeTabs>
        <TransactionsList />
      </TransactionTypeTabs>
    </AppLayout>
  )
}
