import { http, HttpResponse } from 'msw'

import { mockUser } from '../data/user'

const API_BASE = 'http://localhost/v1'

export const authHandlers = [
  http.get(`${API_BASE}/auth/me`, () => HttpResponse.json(mockUser)),
  http.post(`${API_BASE}/auth/login`, () =>
    HttpResponse.json({ user: mockUser, accessToken: 'test-token' })
  ),
  http.post(`${API_BASE}/auth/register`, () =>
    HttpResponse.json({ user: mockUser, accessToken: 'test-token' })
  ),
]
