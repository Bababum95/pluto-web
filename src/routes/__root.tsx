import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'

import { Toaster } from '@/shared/ui/sonner'
import { Devtools } from '@/app/ui/devtools'
import type { AppStore } from '@/app/store'

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
