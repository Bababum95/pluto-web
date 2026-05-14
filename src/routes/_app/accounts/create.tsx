import { createFileRoute } from '@tanstack/react-router'

import { CreateAccountPage } from '@/pages/accounts'

export const Route = createFileRoute('/_app/accounts/create')({
  component: CreateAccountPage,
})
