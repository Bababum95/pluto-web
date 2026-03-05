import { describe, it, expect } from 'vitest'
import { waitFor } from '@testing-library/react'
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
})
