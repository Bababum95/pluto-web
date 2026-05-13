import { createFileRoute } from '@tanstack/react-router'

import { CreateTransferPage } from '@/pages/transfers'

export const Route = createFileRoute('/_app/transfers/create')({
  component: CreateTransferPage,
})
