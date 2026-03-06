import { createFileRoute, Link } from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import { Invoice01Icon } from '@hugeicons/core-free-icons'

import { AppLayout } from '@/components/AppLayout'
import { HomePageContent } from '@/features/home'
import { TransactionTypeTabs } from '@/features/transaction-type'
import { Total } from '@/features/money'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/_app/')({
  component: HomePage,
})

function HomePage() {
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
            <HugeiconsIcon icon={Invoice01Icon} />
          </Link>
        </Button>
      }
    >
      <TransactionTypeTabs>
        <HomePageContent />
      </TransactionTypeTabs>
    </AppLayout>
  )
}
