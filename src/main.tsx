import ReactDOM from 'react-dom/client'
import { StrictMode } from 'react'
import { Provider } from 'react-redux'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'

import { AuthProvider, useAuth } from '@/features/auth'
import { ThemeProvider } from '@/features/theme'
import { store } from '@/store'
import { queryClient } from '@/lib/api'
import { Toaster } from './components/ui/sonner'
import { Spinner } from './components/ui/spinner'
import '@/lib/i18n/config'

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
  },
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function SessionLoader() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background">
      <Spinner className="size-8 text-muted-foreground" />
    </div>
  )
}

function App() {
  const { isAuth, sessionLoading } = useAuth()

  if (sessionLoading) {
    return <SessionLoader />
  }

  return <RouterProvider router={router} context={{ isAuth }} />
}

// Render the app
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <AuthProvider>
            <ThemeProvider>
              <App />
            </ThemeProvider>
          </AuthProvider>
        </Provider>
      </QueryClientProvider>
      <Toaster position="top-right" />
    </StrictMode>
  )
}
