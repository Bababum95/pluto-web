import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

import { fetchCategories } from '@/store/slices/category'
import { fetchAccounts } from '@/store/slices/account'

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
    const state = context.store.getState()
    if (state.category.status === 'idle') {
      await context.store.dispatch(fetchCategories())
    }
    if (state.account.status === 'idle') {
      await context.store.dispatch(fetchAccounts())
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
