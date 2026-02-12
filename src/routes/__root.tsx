import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'

import { Toaster } from '@/components/ui/sonner'
import { Devtools } from '@/components/Devtools'
import type { AppStore } from '@/store'

const showDevtools =
  import.meta.env.DEV && import.meta.env.VITE_SHOW_DEVTOOLS != 'false'

type RouterContext = {
  isAuth: boolean
  store: AppStore
}

function RootComponent() {
  return (
    <>
      <Toaster position="top-right" />
      <Outlet />
      {showDevtools && <Devtools />}
    </>
  )
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
})
