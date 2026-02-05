import ReactDOM from 'react-dom/client'
import { StrictMode } from 'react'
import { Provider } from 'react-redux'
import { RouterProvider, createRouter } from '@tanstack/react-router'

import { AuthProvider, useAuth } from '@/features/auth'
import { ThemeProvider } from '@/features/theme'
import { store } from '@/store'
import '@/lib/i18n/config'
import './index.css'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

// Create a new router instance
const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  scrollRestoration: true,
  // defaultViewTransition: true,
  context: {
    auth: undefined!,
  },
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function App() {
  const auth = useAuth()

  return <RouterProvider router={router} context={{ auth }} />
}

// Render the app
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <Provider store={store}>
        <AuthProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </AuthProvider>
      </Provider>
    </StrictMode>
  )
}
