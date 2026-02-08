import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query'
import { toast } from 'sonner'

import { getAccessToken } from '@/lib/auth-token'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const API_VERSION = import.meta.env.VITE_API_VERSION
const API_ROOT = `${API_BASE_URL}/${API_VERSION}/`

function apiUrl(path: string) {
  return new URL(path.startsWith('/') ? path.slice(1) : path, API_ROOT)
}

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

type RequestConfig = RequestInit & { params?: Record<string, string> }

export async function apiFetch<T>(
  path: string,
  config: RequestConfig = {}
): Promise<T> {
  const { params, ...init } = config

  const url = apiUrl(path)

  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  }

  const token = getAccessToken()
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...init.headers,
  }
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(url.toString(), {
    ...init,
    credentials: 'include',
    headers,
  })

  let body: ApiErrorBody | T | null = null
  const ct = res.headers.get('content-type')
  if (ct?.includes('application/json')) {
    body = (await res.json()) as ApiErrorBody | T
  }

  if (!res.ok) {
    const errBody = body as ApiErrorBody | null
    const raw = errBody?.message
    const message =
      typeof raw === 'string'
        ? raw
        : Array.isArray(raw)
          ? raw[0]
          : res.statusText
    throw new ApiError(res.status, String(message), errBody ?? undefined)
  }

  return body as T
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
