import { http, HttpResponse } from 'msw'

import { mockSettings } from '../data/settings'

const API_BASE = 'http://localhost/v1'
const BASE = `${API_BASE}/settings`

export const settingsHandlers = [
  http.get(BASE, () => HttpResponse.json(mockSettings)),
  http.patch(BASE, () => HttpResponse.json(mockSettings)),
]
