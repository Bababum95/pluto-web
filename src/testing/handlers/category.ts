import { http, HttpResponse } from 'msw'

import { mockCategory } from '../data/category'
import { TEST_API_ROOT } from '../constants'

const BASE = `${TEST_API_ROOT}categories`

export const categoryHandlers = [
  http.get(BASE, () => HttpResponse.json([mockCategory])),
  http.get(`${BASE}/:id`, ({ params }) => {
    if (params.id === mockCategory.id) {
      return HttpResponse.json(mockCategory)
    }
    return HttpResponse.json(
      { message: 'Category not found', statusCode: 404 },
      { status: 404 }
    )
  }),
  http.post(BASE, () => HttpResponse.json(mockCategory)),
  http.patch(`${BASE}/:id`, () => HttpResponse.json(mockCategory)),
]
