import { useEffect } from 'react'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

import { useAppDispatch } from '@/store'
import { fetchCategories } from '@/store/slices/category'

const AppLayout = () => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(fetchCategories())
  }, [dispatch])

  return (
    <div className="flex flex-col min-h-dvh [view-transition-name:main-content] pb-safe">
      <Outlet />
    </div>
  )
}

export const Route = createFileRoute('/_app')({
  component: AppLayout,
  beforeLoad: ({ context, location }) => {
    if (!context.isAuth) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      })
    }
  },
})
