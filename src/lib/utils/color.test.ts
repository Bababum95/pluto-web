import { describe, expect, it } from 'vitest'

import { hsbToHex, parseColor, type HSB } from './color'

describe('color utils', () => {
  it('returns white fallback for empty and invalid values', () => {
    expect(parseColor('   ')).toEqual({ h: 0, s: 0, b: 100, a: 1 })
    expect(parseColor('not-a-color')).toEqual({ h: 0, s: 0, b: 100, a: 1 })
  })

  it('parses hex formats (#rgb, #rrggbb, #rrggbbaa)', () => {
    expect(hsbToHex(parseColor('#0f0'))).toBe('#00ff00')
    expect(hsbToHex(parseColor('112233'))).toBe('#112233')
    expect(hsbToHex(parseColor('#ff000080'), true)).toBe('#ff000080')
  })

  it('parses hsl/hsla and clamps out-of-range values', () => {
    expect(parseColor('hsl(370, 120%, -10%)')).toEqual({
      h: 360,
      s: 0,
      b: 0,
      a: 1,
    })

    const hsla = parseColor('hsla(120, 100%, 50%, 0.4)')
    expect(hsla.h).toBe(120)
    expect(hsla.a).toBeCloseTo(0.4, 6)
    expect(hsbToHex(hsla)).toBe('#00ff00')
  })

  it('parses rgb/rgba and clamps channels + alpha', () => {
    const clamped = parseColor('rgba(300, -10, 0, 2)')
    expect(hsbToHex(clamped, true)).toBe('#ff0000')
    expect(clamped.a).toBe(1)
  })

  it('converts all HSV hue sectors to expected hex', () => {
    const samples: Array<{ hsb: HSB; expected: string }> = [
      { hsb: { h: 30, s: 100, b: 100, a: 1 }, expected: '#ff8000' },
      { hsb: { h: 90, s: 100, b: 100, a: 1 }, expected: '#80ff00' },
      { hsb: { h: 150, s: 100, b: 100, a: 1 }, expected: '#00ff80' },
      { hsb: { h: 210, s: 100, b: 100, a: 1 }, expected: '#0080ff' },
      { hsb: { h: 270, s: 100, b: 100, a: 1 }, expected: '#8000ff' },
      { hsb: { h: 330, s: 100, b: 100, a: 1 }, expected: '#ff0080' },
    ]

    for (const { hsb, expected } of samples) {
      expect(hsbToHex(hsb)).toBe(expected)
    }
  })

  it('adds alpha suffix only when requested and less than 1', () => {
    const value: HSB = { h: 0, s: 0, b: 100, a: 0.5 }
    expect(hsbToHex(value)).toBe('#ffffff')
    expect(hsbToHex(value, true)).toBe('#ffffff80')
  })
})
