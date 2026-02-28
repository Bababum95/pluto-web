import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import { Calendar } from './calendar'

describe('Calendar', () => {
  it('renders calendar with data-slot', () => {
    render(<Calendar mode="single" />)
    const root = document.querySelector('[data-slot="calendar"]')
    expect(root).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <Calendar mode="single" className="custom-calendar" />
    )
    expect(container.querySelector('.custom-calendar')).toBeInTheDocument()
  })

  it('renders in range mode', () => {
    render(<Calendar mode="range" />)
    const root = document.querySelector('[data-slot="calendar"]')
    expect(root).toBeInTheDocument()
  })
})
