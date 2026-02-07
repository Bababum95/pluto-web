import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { z } from 'zod'

import { FALLBACK_URL } from '@/features/auth'

export const Route = createFileRoute('/_auth')({
  component: AuthLayout,
  validateSearch: z.object({
    redirect: z.string().optional().catch(''),
  }),
  beforeLoad: ({ context, search }) => {
    if (context.isAuth) {
      throw redirect({ to: search.redirect || FALLBACK_URL })
    }
  },
})

function AuthLayout() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4 py-12 [view-transition-name:main-content]">
      <Outlet />
    </div>
  )
}
