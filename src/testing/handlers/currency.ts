import { http, HttpResponse } from 'msw'

import { mockCurrency } from '../data/currency'
import { TEST_API_ROOT } from '../constants'

const BASE = `${TEST_API_ROOT}currencies`

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
