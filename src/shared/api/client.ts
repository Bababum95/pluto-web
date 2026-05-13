import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query'
import { toast } from 'sonner'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export type ApiErrorBody = {
  message?: string
  statusCode?: number
  error?: string
}

export class ApiError extends Error {
  readonly status: number
  readonly body: ApiErrorBody | undefined

  constructor(status: number, message: string, body?: ApiErrorBody) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

function handleApiError(error: unknown) {
  if (error instanceof Error) {
    toast.error(error.message)
  }

  console.error('API error:', error)
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      handleApiError(error)
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      handleApiError(error)
    },
  }),
  defaultOptions: {
    queries: {
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
})
