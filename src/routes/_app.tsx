import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

import { initApp } from '@/store/slices/app'

const AppLayout = () => {
  return (
    <div className="flex flex-col min-h-dvh [view-transition-name:main-content] pb-safe relative">
      <Outlet />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-8 -left-24 h-96 w-96 rounded-full bg-primary/12 blur-3xl" />
        <div className="absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-1/2 right-1/4 h-48 w-48 rounded-full bg-primary/6 blur-2xl" />
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_app')({
  component: AppLayout,
  loader: async ({ context }) => {
    if (context.store.getState().app.status === 'idle') {
      await context.store.dispatch(initApp())
    }
  },
  beforeLoad: ({ context, location }) => {
    if (!context.isAuth) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      })
    }
  },
})
