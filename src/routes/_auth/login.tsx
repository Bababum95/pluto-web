import { createFileRoute } from '@tanstack/react-router'

import { LoginPage } from '@/pages/auth'

export const Route = createFileRoute('/_auth/login')({
  component: LoginRoute,
})

function LoginRoute() {
  const search = Route.useSearch()
  return <LoginPage redirect={search.redirect} />
}
