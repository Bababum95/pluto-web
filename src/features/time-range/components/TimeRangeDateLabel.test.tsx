import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

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

  it('renders a week label with a date range', () => {
    render(<TimeRangeDateLabel timeRange="week" timeRangeIndex={0} />)

    expect(screen.getByText(/ – /)).toBeInTheDocument()
  })

  it('renders a month label', () => {
    render(<TimeRangeDateLabel timeRange="month" timeRangeIndex={1} />)

    expect(screen.getByText('May 2024')).toBeInTheDocument()
  })

  it('renders a year label', () => {
    render(<TimeRangeDateLabel timeRange="year" timeRangeIndex={2} />)

    expect(screen.getByText('2022')).toBeInTheDocument()
  })

  it('renders a day label for non-week/month/year types', () => {
    render(<TimeRangeDateLabel timeRange="day" timeRangeIndex={1} />)

    expect(screen.getByText('14 June')).toBeInTheDocument()
  })
})
