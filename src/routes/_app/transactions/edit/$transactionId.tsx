import { createFileRoute } from '@tanstack/react-router'

import { EditTransactionPage } from '@/pages/transactions'

export const Route = createFileRoute('/_app/transactions/edit/$transactionId')({
  component: EditTransactionRoute,
})

function EditTransactionRoute() {
  const { transactionId } = Route.useParams()
  return <EditTransactionPage transactionId={transactionId} />
}
