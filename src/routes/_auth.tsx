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
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-52 -left-24 h-96 w-96 rounded-full bg-primary/12 blur-3xl" />
        <div className="absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 h-48 w-48 rounded-full bg-primary/6 blur-2xl" />
      </div>
      <Outlet />
    </div>
  )
}
