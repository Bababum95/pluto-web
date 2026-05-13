import ReactDOM from 'react-dom/client'
import { StrictMode, useEffect } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'

import { AppProviders } from '@/app/providers'
import { useAuth } from '@/features/auth'
import { store, useAppSelector, registerSyncEntities } from '@/app/store'
import { selectAppInitStatus } from '@/app/store/slices/app'
import { queryClient } from '@/shared/api'
import { FullScreenLoader } from '@/components/full-screen-loader'
import { LOCAL_DATA_MODE } from '@/shared/lib/local-storage/config'
import { syncCoordinator } from '@/shared/lib/local-storage/sync-coordinator'
import { SyncErrorNotifier } from '@/shared/lib/local-storage/sync-error-notifier'
import '@/shared/lib/i18n/config'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

import './index.css'

// Create a new router instance
const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  scrollRestoration: true,
  // defaultViewTransition: true,
  context: {
    isAuth: false,
    store,
  },
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function App() {
  const { isAuth, sessionLoading } = useAuth()
  const status = useAppSelector(selectAppInitStatus)

  useEffect(() => {
    if (LOCAL_DATA_MODE === 'dexie' && isAuth) {
      registerSyncEntities()
      syncCoordinator.start()
      return () => syncCoordinator.stop()
    }
  }, [isAuth])

  return (
    <>
      <FullScreenLoader isVisible={sessionLoading || status === 'pending'} />
      {LOCAL_DATA_MODE === 'dexie' && <SyncErrorNotifier />}
      {!sessionLoading && (
        <RouterProvider router={router} context={{ isAuth }} />
      )}
    </>
  )
}

// Render the app
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <AppProviders>
          <App />
        </AppProviders>
      </QueryClientProvider>
    </StrictMode>
  )
}
