import { createFileRoute } from '@tanstack/react-router'

import { AppLayout } from '@/components/AppLayout'
import { HomePageContent } from '@/features/home'
import { TransactionTypeTabs } from '@/features/transaction-type'
import { Total } from '@/features/money'

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
    >
      <TransactionTypeTabs>
        <HomePageContent />
      </TransactionTypeTabs>
    </AppLayout>
  )
}
