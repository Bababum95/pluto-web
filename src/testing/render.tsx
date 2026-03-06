import { Provider } from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, type RenderOptions } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'

import { createStore, type RootState } from '@/store'
import { AuthProvider } from '@/features/auth'

type PreloadedState = Partial<RootState>

function createTestStore(preloadedState?: PreloadedState) {
  return createStore(preloadedState)
}

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
}

type RenderWithProvidersOptions = Omit<RenderOptions, 'wrapper'> & {
  preloadedState?: PreloadedState
  store?: ReturnType<typeof createTestStore>
  queryClient?: QueryClient
  withAuth?: boolean
}

function createWrapper(options: RenderWithProvidersOptions = {}) {
  const {
    store = createTestStore(options.preloadedState),
    queryClient = createTestQueryClient(),
    withAuth = false,
  } = options

  return function Wrapper({ children }: { children: ReactNode }) {
    const content = withAuth ? (
      <AuthProvider>{children}</AuthProvider>
    ) : (
      children
    )
    return (
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>{content}</Provider>
      </QueryClientProvider>
    )
  }
}

export function renderWithProviders(
  ui: ReactElement,
  options: RenderWithProvidersOptions = {}
): ReturnType<typeof render> & {
  store: ReturnType<typeof createTestStore>
  queryClient: QueryClient
} {
  const { preloadedState, store, queryClient, withAuth, ...renderOptions } =
    options
  const testStore = store ?? createTestStore(preloadedState)
  const testQueryClient = queryClient ?? createTestQueryClient()

  const Wrapper = createWrapper({
    store: testStore,
    queryClient: testQueryClient,
    withAuth,
    preloadedState,
  })

  return {
    ...render(ui, {
      wrapper: Wrapper,
      ...renderOptions,
    }),
    store: testStore,
    queryClient: testQueryClient,
  }
}

export { createTestStore, createTestQueryClient }
