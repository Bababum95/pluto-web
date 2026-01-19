import { createFileRoute } from '@tanstack/react-router'

import { AppLayout } from '@/components/AppLayout'
import { HomePageContent } from '@/features/home'
import { TransactionTypeTabs } from '@/features/transaction-type'

export const Route = createFileRoute('/_app/')({
  component: HomePage,
})

function HomePage() {
  return (
    <AppLayout >
      <TransactionTypeTabs>
        <HomePageContent />
      </TransactionTypeTabs>
    </AppLayout>
  )
}
