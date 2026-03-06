import { http, HttpResponse } from 'msw'

import { mockTag } from '../data/tag'
import { TEST_API_ROOT } from '../constants'

const BASE = `${TEST_API_ROOT}tags`

export const tagHandlers = [
  http.get(BASE, () => HttpResponse.json([mockTag])),
  http.get(`${BASE}/:id`, ({ params }) => {
    if (params.id === mockTag.id) {
      return HttpResponse.json(mockTag)
    }
    return HttpResponse.json(
      { message: 'Tag not found', statusCode: 404 },
      { status: 404 }
    )
  }),
  http.post(BASE, () => HttpResponse.json(mockTag)),
  http.patch(`${BASE}/:id`, () => HttpResponse.json(mockTag)),
  http.delete(`${BASE}/:id`, () => new HttpResponse(null, { status: 204 })),
]
