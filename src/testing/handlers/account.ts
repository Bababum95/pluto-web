import { http, HttpResponse } from 'msw'

import {
  mockAccount,
  mockAccountListResponse,
  mockAccountWithSummaryResponse,
} from '../data/account'

const API_BASE = 'http://localhost/v1'
const BASE = `${API_BASE}/accounts`

export const accountHandlers = [
  http.get(BASE, () => HttpResponse.json(mockAccountListResponse)),
  http.get(`${BASE}/summary`, () =>
    HttpResponse.json(mockAccountListResponse.summary)
  ),
  http.get(`${BASE}/:id`, ({ params }) => {
    if (params.id === mockAccount.id) {
      return HttpResponse.json(mockAccount)
    }
    return HttpResponse.json(
      { message: 'Account not found', statusCode: 404 },
      { status: 404 }
    )
  }),
  http.post(BASE, () => HttpResponse.json(mockAccountWithSummaryResponse)),
  http.patch(`${BASE}/:id`, () =>
    HttpResponse.json(mockAccountWithSummaryResponse)
  ),
  http.patch(`${BASE}/excluded/:id`, () =>
    HttpResponse.json(mockAccountWithSummaryResponse)
  ),
  http.patch(`${BASE}/reorder`, () => new HttpResponse(null, { status: 204 })),
  http.delete(`${BASE}/:id`, () =>
    HttpResponse.json(mockAccountListResponse.summary)
  ),
]
