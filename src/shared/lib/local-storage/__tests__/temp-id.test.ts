import { describe, it, expect } from 'vitest'

import { generateTempEntityId } from '../temp-id'

describe('generateTempEntityId', () => {
  it('returns temp- prefix and a UUID v4 segment', () => {
    const id = generateTempEntityId()
    expect(id.startsWith('temp-')).toBe(true)
    expect(id.length).toBeGreaterThan('temp-'.length)
    expect(id).toMatch(/^temp-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
  })

  it('returns unique ids across calls', () => {
    const a = generateTempEntityId()
    const b = generateTempEntityId()
    expect(a).not.toBe(b)
  })
})
