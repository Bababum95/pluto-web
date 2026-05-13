import type { ReactNode } from 'react'
import { Provider } from 'react-redux'

import { store } from '@/app/store'

import { AppearanceProvider } from './appearance-provider'
import { AuthProvider } from './auth-provider'
import { ThemeProvider } from './theme-provider'

type AppProvidersProps = {
  children: ReactNode
}

/**
 * Composes Redux and global shell providers (auth, theme, appearance).
 * QueryClient and router live in main.tsx.
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <Provider store={store}>
      <AuthProvider>
        <ThemeProvider>
          <AppearanceProvider>{children}</AppearanceProvider>
        </ThemeProvider>
      </AuthProvider>
    </Provider>
  )
}

export { AuthProvider } from './auth-provider'
export { ThemeProvider } from './theme-provider'
export { AppearanceProvider } from './appearance-provider'
