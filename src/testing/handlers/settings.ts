import { http, HttpResponse } from 'msw'

import { mockSettings } from '../data/settings'
import { TEST_API_ROOT } from '../constants'

const BASE = `${TEST_API_ROOT}settings`

export const settingsHandlers = [
  http.get(BASE, () => HttpResponse.json(mockSettings)),
  http.patch(BASE, () => HttpResponse.json(mockSettings)),
]
