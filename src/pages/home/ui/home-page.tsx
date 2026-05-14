import { Link } from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import { TransactionHistoryIcon } from '@hugeicons/core-free-icons'

import { AppLayout } from '@/components/AppLayout'
import { HomeCategoryInsights } from '@/widgets/category-chart'
import { TransactionTypeTabs } from '@/features/transaction-type'
import { Total } from '@/features/money'
import { Button } from '@/shared/ui/button'

export function HomePage() {
  return (
    <AppLayout
      title={
        <Total
          size="sm"
          className="flex flex-col items-center justify-center"
        />
      }
      actions={
        <Button variant="ghost" size="icon" asChild>
          <Link to="/transactions" viewTransition={{ types: ['slide-left'] }}>
            <HugeiconsIcon icon={TransactionHistoryIcon} />
          </Link>
        </Button>
      }
    >
      <TransactionTypeTabs>
        <HomeCategoryInsights />
      </TransactionTypeTabs>
    </AppLayout>
  )
}
