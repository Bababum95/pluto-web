import { http, HttpResponse } from 'msw'

import { mockTransfer } from '../data/transfer'

const API_BASE = 'http://localhost/v1'
const BASE = `${API_BASE}/transfers`

export const transferHandlers = [
  http.get(BASE, () => HttpResponse.json([mockTransfer])),
  http.get(`${BASE}/:id`, ({ params }) => {
    if (params.id === mockTransfer.id) {
      return HttpResponse.json(mockTransfer)
    }
    return HttpResponse.json(
      { message: 'Transfer not found', statusCode: 404 },
      { status: 404 }
    )
  }),
  http.post(BASE, () => HttpResponse.json(mockTransfer, { status: 201 })),
  http.patch(`${BASE}/:id`, () => HttpResponse.json(mockTransfer)),
  http.delete(`${BASE}/:id`, () => new HttpResponse(null, { status: 204 })),
]
