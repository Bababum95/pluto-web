import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

import { fetchCategories } from '@/store/slices/category'

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
    await context.store.dispatch(fetchCategories())
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
