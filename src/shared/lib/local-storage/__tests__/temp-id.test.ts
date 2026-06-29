import { describe, it, expect } from 'vitest'

import {
  generateTempEntityId,
  isTempEntityId,
  TEMP_ID_PREFIX,
} from '../temp-id'

describe('generateTempEntityId', () => {
  it('returns temp- prefix and a UUID v4 segment', () => {
    const id = generateTempEntityId()
    expect(id.startsWith(TEMP_ID_PREFIX)).toBe(true)
    expect(id.length).toBeGreaterThan(TEMP_ID_PREFIX.length)
    expect(id).toMatch(
      new RegExp(
        `^${TEMP_ID_PREFIX}[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`
      )
    )
  })

  it('returns unique ids across calls', () => {
    const a = generateTempEntityId()
    const b = generateTempEntityId()
    expect(a).not.toBe(b)
  })
})

describe('isTempEntityId', () => {
  it(`returns true for ids with ${TEMP_ID_PREFIX} prefix`, () => {
    expect(isTempEntityId(`${TEMP_ID_PREFIX}123`)).toBe(true)
  })

  it('returns false for real ids', () => {
    expect(isTempEntityId('tx-1')).toBe(false)
    expect(isTempEntityId('')).toBe(false)
  })
})
