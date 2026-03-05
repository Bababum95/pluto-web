import { http, HttpResponse } from 'msw'

import { mockCurrency } from '../data/currency'

const API_BASE = 'http://localhost/v1'
const BASE = `${API_BASE}/currencies`

export const currencyHandlers = [
  http.get(BASE, () => HttpResponse.json([mockCurrency])),
  http.get(`${BASE}/:id`, ({ params }) => {
    if (params.id === mockCurrency.id) {
      return HttpResponse.json(mockCurrency)
    }
    return HttpResponse.json(
      { message: 'Currency not found', statusCode: 404 },
      { status: 404 }
    )
  }),
]
