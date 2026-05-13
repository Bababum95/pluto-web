import { createFileRoute } from '@tanstack/react-router'

import { CreateTransactionPage } from '@/pages/transactions'

export const Route = createFileRoute('/_app/transactions/create')({
  component: CreateTransactionPage,
})
