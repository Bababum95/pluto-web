import { http, HttpResponse } from 'msw'

import { mockTransaction } from '../data/transaction'

const API_BASE = 'http://localhost/v1'
const BASE = `${API_BASE}/transactions`

export const transactionHandlers = [
  http.get(BASE, () => HttpResponse.json([mockTransaction])),
  http.get(`${BASE}/:id`, ({ params }) => {
    if (params.id === mockTransaction.id) {
      return HttpResponse.json(mockTransaction)
    }
    return HttpResponse.json(
      { message: 'Transaction not found', statusCode: 404 },
      { status: 404 }
    )
  }),
  http.post(BASE, () =>
    HttpResponse.json({
      account: { id: 'account-1', balance: {} },
      summary: { total_raw: 0, scale: 2, total: 0, currency: {} },
      transaction: mockTransaction,
    })
  ),
  http.patch(`${BASE}/:id`, () => HttpResponse.json(mockTransaction)),
  http.delete(`${BASE}/:id`, () => new HttpResponse(null, { status: 204 })),
]
