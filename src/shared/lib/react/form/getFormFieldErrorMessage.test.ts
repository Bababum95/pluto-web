import { describe, it, expect } from 'vitest'
import { getFormFieldErrorMessage } from './getFormFieldErrorMessage'

describe('getFormFieldErrorMessage', () => {
  it('returns empty string for empty array', () => {
    expect(getFormFieldErrorMessage([])).toBe('')
  })

  it('returns the message for a single element', () => {
    expect(getFormFieldErrorMessage([{ message: 'Required' }])).toBe('Required')
  })

  it('returns messages joined by newline for multiple elements', () => {
    expect(
      getFormFieldErrorMessage([
        { message: 'First error' },
        { message: 'Second error' },
      ])
    ).toBe('First error\nSecond error')
  })

  it('skips undefined elements', () => {
    expect(
      getFormFieldErrorMessage([undefined, { message: 'Only this' }])
    ).toBe('Only this')
  })

  it('skips elements with undefined message', () => {
    expect(
      getFormFieldErrorMessage([{ message: undefined }, { message: 'Valid' }])
    ).toBe('Valid')
  })

  it('skips empty string messages (filter(Boolean))', () => {
    expect(
      getFormFieldErrorMessage([{ message: '' }, { message: 'Shown' }])
    ).toBe('Shown')
  })

  it('returns empty string when all elements are undefined', () => {
    expect(getFormFieldErrorMessage([undefined, undefined])).toBe('')
  })

  it('handles mixed: undefined items, empty messages, and valid messages', () => {
    expect(
      getFormFieldErrorMessage([
        undefined,
        { message: 'First' },
        { message: '' },
        undefined,
        { message: 'Second' },
      ])
    ).toBe('First\nSecond')
  })
})
