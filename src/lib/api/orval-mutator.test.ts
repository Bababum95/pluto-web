import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import Axios from 'axios'
import { http, HttpResponse } from 'msw'
import { createElement, useEffect } from 'react'
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
  useMutation,
} from '@tanstack/react-query'
import { render, waitFor } from '@testing-library/react'

import { ApiError } from './client'
import { customInstance } from './orval-mutator'
import { TEST_API_ROOT } from '@/testing/constants'
import { server } from '@/testing/server'

vi.mock('@/features/auth/utils/auth-token', () => ({
  getAccessToken: vi.fn(),
}))
vi.mock('sonner', () => ({
  toast: { error: vi.fn() },
}))
import { toast } from 'sonner'

import { getAccessToken } from '@/features/auth/utils/auth-token'

const createTestQueryClient = (): QueryClient => {
  const handleQueryError = (error: unknown): void => {
    if (error instanceof Error) {
      toast.error(error.message)
    }

    console.error('API error:', error)
  }

  return new QueryClient({
    queryCache: new QueryCache({
      onError: handleQueryError,
    }),
    mutationCache: new MutationCache({
      onError: handleQueryError,
    }),
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
}

describe('customInstance (Orval + axios)', () => {
  beforeEach(() => {
    vi.mocked(getAccessToken).mockReturnValue(null)
  })

  it('requests OpenAPI path under base URL', async () => {
    let capturedUrl = ''
    server.use(
      http.get(`${TEST_API_ROOT}auth/me`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ id: '1' })
      })
    )
    await customInstance({ url: '/v1/auth/me', method: 'GET' })
    expect(capturedUrl).toBe(`${TEST_API_ROOT}auth/me`)
  })

  it('passes query params on GET', async () => {
    let capturedUrl = ''
    server.use(
      http.get(`${TEST_API_ROOT}transactions`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json([])
      })
    )
    await customInstance({
      url: '/v1/transactions',
      method: 'GET',
      params: { account: 'acc-1' },
    })
    expect(capturedUrl).toContain('account=acc-1')
  })

  it('adds Authorization header when token is present', async () => {
    vi.mocked(getAccessToken).mockReturnValue('secret-token')
    let capturedAuth = ''
    server.use(
      http.get(`${TEST_API_ROOT}auth/me`, ({ request }) => {
        capturedAuth = request.headers.get('Authorization') ?? ''
        return HttpResponse.json({ id: '1' })
      })
    )
    await customInstance({ url: '/v1/auth/me', method: 'GET' })
    expect(capturedAuth).toBe('Bearer secret-token')
  })

  it('does not add Authorization header when token is null', async () => {
    let capturedAuth: string | null = null
    server.use(
      http.get(`${TEST_API_ROOT}auth/me`, ({ request }) => {
        capturedAuth = request.headers.get('Authorization')
        return HttpResponse.json({ id: '1' })
      })
    )
    await customInstance({ url: '/v1/auth/me', method: 'GET' })
    expect(capturedAuth).toBeNull()
  })

  it('throws ApiError with status and message on error response', async () => {
    server.use(
      http.get(`${TEST_API_ROOT}error`, () =>
        HttpResponse.json(
          { message: 'Not found', statusCode: 404 },
          { status: 404 }
        )
      )
    )
    await expect(
      customInstance({ url: '/v1/error', method: 'GET' })
    ).rejects.toThrow(ApiError)
    try {
      await customInstance({ url: '/v1/error', method: 'GET' })
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError)
      expect((e as ApiError).status).toBe(404)
      expect((e as ApiError).message).toBe('Not found')
      expect((e as ApiError).body).toEqual({
        message: 'Not found',
        statusCode: 404,
      })
    }
  })

  it('uses first message when error body.message is an array', async () => {
    server.use(
      http.get(`${TEST_API_ROOT}array-error`, () =>
        HttpResponse.json(
          { message: ['First', 'Second'], statusCode: 400 },
          { status: 400 }
        )
      )
    )

    try {
      await customInstance({ url: '/v1/array-error', method: 'GET' })
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError)
      expect((e as ApiError).status).toBe(400)
      expect((e as ApiError).message).toBe('First')
      expect((e as ApiError).body).toEqual({
        message: ['First', 'Second'],
        statusCode: 400,
      })
    }
  })

  it('rethrows original Axios error when Axios.isAxiosError returns false', async () => {
    const isAxiosErrorSpy = vi
      .spyOn(Axios, 'isAxiosError')
      .mockImplementation(() => false)

    server.use(
      http.get(`${TEST_API_ROOT}non-api-error`, () =>
        HttpResponse.json(
          { message: 'Boom', statusCode: 500 },
          { status: 500 }
        )
      )
    )

    try {
      await customInstance({ url: '/v1/non-api-error', method: 'GET' })
    } catch (e) {
      expect(e).not.toBeInstanceOf(ApiError)
      expect(e).toBeInstanceOf(Error)
    } finally {
      isAxiosErrorSpy.mockRestore()
    }
  })

  it('returns parsed JSON on success', async () => {
    const data = { id: '1', name: 'Test' }
    server.use(http.get(`${TEST_API_ROOT}data`, () => HttpResponse.json(data)))
    const result = await customInstance<{ id: string; name: string }>({
      url: '/v1/data',
      method: 'GET',
    })
    expect(result).toEqual(data)
  })
})

describe('queryClient global error handling (handleApiError)', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>
  let queryClient: QueryClient

  beforeEach(() => {
    vi.mocked(toast.error).mockClear()
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    queryClient = createTestQueryClient()
  })

  afterEach(() => {
    queryClient.clear()
    consoleErrorSpy.mockRestore()
  })

  it('calls toast.error and console.error when a query fails', async () => {
    await expect(
      queryClient.fetchQuery({
        queryKey: ['global-err-query'],
        queryFn: async () => {
          throw new Error('Query failed')
        },
      })
    ).rejects.toThrow('Query failed')

    expect(toast.error).toHaveBeenCalledTimes(1)
    expect(toast.error).toHaveBeenCalledWith('Query failed')
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'API error:',
      expect.any(Error)
    )
  })

  it('calls toast.error and console.error when a mutation fails', async () => {
    const mutationErrorMessage = 'Mutation failed'

    function FailingMutationRunner() {
      const mutation = useMutation({
        mutationFn: async () => {
          throw new Error(mutationErrorMessage)
        },
      })
      useEffect(() => {
        mutation.mutate()
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [])
      return null
    }

    render(
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(FailingMutationRunner)
      )
    )

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledTimes(1)
      expect(toast.error).toHaveBeenCalledWith(mutationErrorMessage)
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'API error:',
        expect.any(Error)
      )
    })
  })
})
