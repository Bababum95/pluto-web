import { createFileRoute } from '@tanstack/react-router'

import { TransferDetailPage } from '@/pages/transfers'

export const Route = createFileRoute('/_app/transfers/$transferId')({
  component: TransferDetailRoute,
})

function TransferDetailRoute() {
  const { transferId } = Route.useParams()
  return <TransferDetailPage transferId={transferId} />
}
