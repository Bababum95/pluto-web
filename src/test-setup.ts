import { afterAll, afterEach, beforeAll } from 'vitest'

import '@testing-library/jest-dom/vitest'
import '@/lib/i18n/config'
import { server } from '@/testing/server'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

if (typeof ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver
}
