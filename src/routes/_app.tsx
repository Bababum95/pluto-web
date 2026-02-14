import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

import { initApp } from '@/store/slices/app'

const AppLayout = () => {
  return (
    <div className="flex flex-col min-h-dvh [view-transition-name:main-content] pb-safe">
      <Outlet />
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
