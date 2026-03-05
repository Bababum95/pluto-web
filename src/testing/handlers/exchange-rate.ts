import { http, HttpResponse } from 'msw'

import { mockExchangeRate } from '../data/exchange-rate'

const API_BASE = 'http://localhost/v1'
const BASE = `${API_BASE}/rates`

export const exchangeRateHandlers = [
  http.get(BASE, () => HttpResponse.json([mockExchangeRate])),
  http.get(`${BASE}/code/:code`, ({ params }) => {
    if (params.code === mockExchangeRate.code) {
      return HttpResponse.json(mockExchangeRate)
    }
    return HttpResponse.json(
      { message: 'Rate not found', statusCode: 404 },
      { status: 404 }
    )
  }),
  http.get(`${BASE}/:id`, ({ params }) => {
    if (params.id === mockExchangeRate.id) {
      return HttpResponse.json(mockExchangeRate)
    }
    return HttpResponse.json(
      { message: 'Rate not found', statusCode: 404 },
      { status: 404 }
    )
  }),
]
