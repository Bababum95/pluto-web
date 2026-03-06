import { http, HttpResponse } from 'msw'

import { mockUser } from '../data/user'
import { TEST_API_ROOT } from '../constants'

const BASE = `${TEST_API_ROOT}auth`

export const authHandlers = [
  http.get(`${BASE}/me`, () => HttpResponse.json(mockUser)),
  http.post(`${BASE}/login`, () =>
    HttpResponse.json({ user: mockUser, accessToken: 'test-token' })
  ),
  http.post(`${BASE}/register`, () =>
    HttpResponse.json({ user: mockUser, accessToken: 'test-token' })
  ),
]
