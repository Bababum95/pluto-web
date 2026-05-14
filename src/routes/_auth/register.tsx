import { createFileRoute } from '@tanstack/react-router'

import { RegisterPage } from '@/pages/auth'

export const Route = createFileRoute('/_auth/register')({
  component: RegisterRoute,
})

function RegisterRoute() {
  const search = Route.useSearch()
  return <RegisterPage redirect={search.redirect} />
}
