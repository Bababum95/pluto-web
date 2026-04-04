import { render } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { TimeRangeDateLabel } from './TimeRangeDateLabel'

describe('TimeRangeDateLabel', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders nothing for period', () => {
    const { container } = render(
      <TimeRangeDateLabel timeRange="period" timeRangeIndex={0} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders a label for week', () => {
    const { container } = render(
      <TimeRangeDateLabel timeRange="week" timeRangeIndex={0} />
    )
    expect(container.textContent).toMatch(/–/)
    expect(container.firstChild).not.toBeNull()
  })
})
