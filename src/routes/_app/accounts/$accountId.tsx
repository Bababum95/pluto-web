import { createFileRoute } from '@tanstack/react-router'

import { EditAccountPage } from '@/pages/accounts'

export const Route = createFileRoute('/_app/accounts/$accountId')({
  component: EditAccountRoute,
})

function EditAccountRoute() {
  const { accountId } = Route.useParams()
  return <EditAccountPage accountId={accountId} />
}
