import { createFileRoute } from '@tanstack/react-router'

import { ShowTransactionPage } from '@/pages/transactions'

export const Route = createFileRoute('/_app/transactions/show/$transactionId')({
  component: ShowTransactionRoute,
})

function ShowTransactionRoute() {
  const { transactionId } = Route.useParams()
  return <ShowTransactionPage transactionId={transactionId} />
}
