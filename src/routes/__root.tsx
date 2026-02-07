import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'

import { Devtools } from '@/components/Devtools'

const showDevtools =
  import.meta.env.DEV && import.meta.env.VITE_SHOW_DEVTOOLS != 'false'

type RouterContext = {
  isAuth: boolean
}

function RootComponent() {
  return (
    <>
      <Outlet />
      {showDevtools && <Devtools />}
    </>
  )
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
})
