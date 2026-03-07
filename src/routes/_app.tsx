import { useEffect, useState } from 'react'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

import { initApp } from '@/store/slices/app'
import { useAuth } from '@/features/auth'
import {
  usePasskeySupport,
  PasskeyPromptDialog,
  PASSKEY_REGISTERED_KEY,
} from '@/features/passkey'

const AppLayout = () => {
  const { justLoggedIn, clearJustLoggedIn } = useAuth()
  const { platformAvailable } = usePasskeySupport()
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    if (!justLoggedIn) return
    if (platformAvailable && !localStorage.getItem(PASSKEY_REGISTERED_KEY)) {
      queueMicrotask(() => {
        setShowPrompt(true)
        clearJustLoggedIn()
      })
    } else {
      clearJustLoggedIn()
    }
  }, [justLoggedIn, platformAvailable, clearJustLoggedIn])

  return (
    <div className="flex flex-col min-h-dvh [view-transition-name:main-content] pb-safe">
      <Outlet />
      <PasskeyPromptDialog
        open={showPrompt}
        onClose={() => setShowPrompt(false)}
      />
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
