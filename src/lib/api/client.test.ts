import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { createElement, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { QueryClientProvider } from '@tanstack/react-query'
import { render, waitFor } from '@testing-library/react'

import { apiFetch, ApiError, queryClient } from './client'
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

describe('apiFetch', () => {
  beforeEach(() => {
    vi.mocked(getAccessToken).mockReturnValue(null)
  })

  it('builds URL from path and base', async () => {
    let capturedUrl = ''
    server.use(
      http.get(`${TEST_API_ROOT}auth/me`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ id: '1' })
      })
    )
    await apiFetch('/auth/me')
    expect(capturedUrl).toBe(`${TEST_API_ROOT}auth/me`)
  })

  it('appends params to URL as query string', async () => {
    let capturedUrl = ''
    server.use(
      http.get(`${TEST_API_ROOT}transactions`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json([])
      })
    )
    await apiFetch('/transactions', {
      params: { from: '2024-01-01', to: '2024-01-31' },
    })
    expect(capturedUrl).toContain('from=2024-01-01')
    expect(capturedUrl).toContain('to=2024-01-31')
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
    await apiFetch('/auth/me')
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
    await apiFetch('/auth/me')
    expect(capturedAuth).toBeNull()
  })

  it('throws ApiError with status and message on non-ok response', async () => {
    server.use(
      http.get(`${TEST_API_ROOT}error`, () =>
        HttpResponse.json(
          { message: 'Not found', statusCode: 404 },
          { status: 404 }
        )
      )
    )
    await expect(apiFetch('/error')).rejects.toThrow(ApiError)
    try {
      await apiFetch('/error')
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

  it('uses res.statusText when response body has no message', async () => {
    server.use(
      http.get(`${TEST_API_ROOT}no-msg`, () =>
        HttpResponse.json(
          {},
          { status: 500, statusText: 'Internal Server Error' }
        )
      )
    )
    await expect(apiFetch('/no-msg')).rejects.toThrow(ApiError)
    try {
      await apiFetch('/no-msg')
    } catch (e) {
      expect((e as ApiError).status).toBe(500)
      expect((e as ApiError).message).toBe('Internal Server Error')
    }
  })

  it('calls onError when provided and does not call default handler', async () => {
    server.use(
      http.get(`${TEST_API_ROOT}fail`, () =>
        HttpResponse.json({ message: 'Server error' }, { status: 500 })
      )
    )
    const onError = vi.fn()
    await expect(apiFetch('/fail', {}, onError)).rejects.toThrow(ApiError)
    expect(onError).toHaveBeenCalledTimes(1)
    expect(onError).toHaveBeenCalledWith(expect.any(ApiError))
    expect((onError.mock.calls[0][0] as ApiError).message).toBe('Server error')
  })

  it('returns parsed JSON on success', async () => {
    const data = { id: '1', name: 'Test' }
    server.use(http.get(`${TEST_API_ROOT}data`, () => HttpResponse.json(data)))
    const result = await apiFetch<typeof data>('/data')
    expect(result).toEqual(data)
  })
})

describe('queryClient global error handling (handleApiError)', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.mocked(toast.error).mockClear()
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
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
        // Run once on mount; adding mutation to deps would re-run every render
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
