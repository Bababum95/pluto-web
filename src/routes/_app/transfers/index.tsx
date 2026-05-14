import { createFileRoute } from '@tanstack/react-router'

import { TransfersPage } from '@/pages/transfers'

export const Route = createFileRoute('/_app/transfers/')({
  component: TransfersPage,
})
