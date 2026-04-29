import { describe, it, expect } from 'vitest'
import { waitFor } from '@testing-library/react'
import { useState } from 'react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { AuthProvider, useAuth } from '@/features/auth'
import { renderWithProviders } from '@/testing/render'
import { server } from '@/testing/server'
import { mockUser } from '@/testing/data'

function LoginTestHelper() {
  const { login, isAuth } = useAuth()
  return (
    <div>
      <span data-testid="auth-status">
        {isAuth ? 'authenticated' : 'anonymous'}
      </span>
      <button
        type="button"
        onClick={() =>
          login({ email: 'test@example.com', password: 'password123' })
        }
      >
        Login
      </button>
    </div>
  )
}

function RegisterTestHelper() {
  const { register, isAuth } = useAuth()
  return (
    <div>
      <span data-testid="auth-status">
        {isAuth ? 'authenticated' : 'anonymous'}
      </span>
      <button
        type="button"
        onClick={() =>
          register({
            name: 'New User',
            email: 'new@example.com',
            password: 'password123',
          })
        }
      >
        Register
      </button>
    </div>
  )
}

function RegisterFailureTestHelper() {
  const { register } = useAuth()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  return (
    <div>
      {errorMsg && <span data-testid="error-msg">{errorMsg}</span>}
      <button
        type="button"
        onClick={async () => {
          setErrorMsg(null)
          try {
            await register({
              name: 'New User',
              email: 'new@example.com',
              password: 'password123',
            })
          } catch (e) {
            setErrorMsg((e as Error).message)
          }
        }}
      >
        Register
      </button>
    </div>
  )
}

function LogoutTestHelper() {
  const { logout, isAuth } = useAuth()
  return (
    <div>
      <span data-testid="auth-status">
        {isAuth ? 'authenticated' : 'anonymous'}
      </span>
      <button type="button" onClick={() => logout()}>
        Logout
      </button>
    </div>
  )
}

function SessionStatusHelper() {
  const { isAuth, sessionLoading } = useAuth()
  return (
    <div>
      <span data-testid="auth-status">
        {isAuth ? 'authenticated' : 'anonymous'}
      </span>
      <span data-testid="session-loading">
        {sessionLoading ? 'loading' : 'ready'}
      </span>
    </div>
  )
}

describe('Auth (integration)', () => {
  it('login flow: request is sent, response updates store and auth context', async () => {
    server.use(
      http.get('http://localhost/v1/auth/me', () =>
        HttpResponse.json(
          { message: 'Unauthorized', statusCode: 401 },
          { status: 401 }
        )
      )
    )

    const { store, getByTestId, getByRole } = renderWithProviders(
      <AuthProvider>
        <LoginTestHelper />
      </AuthProvider>,
      { withAuth: false }
    )

    await waitFor(() => {
      expect(getByTestId('auth-status')).toHaveTextContent('anonymous')
    })

    const loginButton = getByRole('button', { name: 'Login' })
    loginButton.click()

    await waitFor(
      () => {
        expect(store.getState().user.user?.email).toBe(mockUser.email)
      },
      { timeout: 3000 }
    )

    expect(getByTestId('auth-status')).toHaveTextContent('authenticated')
  })

  it('register flow: API request, setAccessToken, setUser, isAuth true', async () => {
    server.use(
      http.get('http://localhost/v1/auth/me', () =>
        HttpResponse.json(
          { message: 'Unauthorized', statusCode: 401 },
          { status: 401 }
        )
      )
    )

    const { store, getByTestId, getByRole } = renderWithProviders(
      <AuthProvider>
        <RegisterTestHelper />
      </AuthProvider>,
      { withAuth: false }
    )

    await waitFor(() => {
      expect(getByTestId('auth-status')).toHaveTextContent('anonymous')
    })

    getByRole('button', { name: 'Register' }).click()

    await waitFor(
      () => {
        expect(store.getState().user.user?.email).toBe(mockUser.email)
      },
      { timeout: 3000 }
    )

    expect(getByTestId('auth-status')).toHaveTextContent('authenticated')
  })

  it('logout flow: clearUser, isAuth false', async () => {
    const user = userEvent.setup()
    const { store, getByTestId, getByRole } = renderWithProviders(
      <AuthProvider>
        <LogoutTestHelper />
      </AuthProvider>,
      {
        withAuth: false,
        preloadedState: { user: { user: mockUser, status: 'idle' } },
      }
    )

    await waitFor(() => {
      expect(getByTestId('auth-status')).toHaveTextContent('authenticated')
    })

    await user.click(getByRole('button', { name: 'Logout' }))

    await waitFor(() => {
      expect(store.getState().user.user).toBeNull()
      expect(getByTestId('auth-status')).toHaveTextContent('anonymous')
    })
  })

  it('session restoration: GET /auth/me success sets user and isAuth', async () => {
    const { store, getByTestId } = renderWithProviders(
      <AuthProvider>
        <SessionStatusHelper />
      </AuthProvider>,
      { withAuth: false }
    )

    await waitFor(
      () => {
        expect(getByTestId('session-loading')).toHaveTextContent('ready')
      },
      { timeout: 3000 }
    )

    expect(getByTestId('auth-status')).toHaveTextContent('authenticated')
    expect(store.getState().user.user?.email).toBe(mockUser.email)
  })

  it('register error: empty response throws "Register returned empty response"', async () => {
    server.use(
      http.get('http://localhost/v1/auth/me', () =>
        HttpResponse.json(
          { message: 'Unauthorized', statusCode: 401 },
          { status: 401 }
        )
      )
    )

    server.use(
      http.post('http://localhost/v1/auth/register', () =>
        HttpResponse.json(null)
      )
    )

    const { getByRole, getByTestId } = renderWithProviders(
      <AuthProvider>
        <RegisterFailureTestHelper />
      </AuthProvider>,
      { withAuth: false }
    )

    getByRole('button', { name: 'Register' }).click()

    await waitFor(
      () => {
        expect(getByTestId('error-msg')).toHaveTextContent(
          'Register returned empty response'
        )
      },
      { timeout: 3000 }
    )
  })
})
