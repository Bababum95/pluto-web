import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

import { Balance } from './Balance'
import { DEFAULT_CURRENCY } from '../constants'

describe('Balance', () => {
  it('renders formatted balance with given currency', () => {
    render(
      <Balance
        balance={1234.56}
        currency={{ code: 'USD', decimal_digits: 2 }}
      />
    )
    const el = screen.getByText(/\d/)
    expect(el).toBeInTheDocument()
    expect(el.textContent).toContain('1')
    expect(el.textContent).toContain('234')
  })

  it('uses balance 0 when balance prop is undefined', () => {
    render(<Balance currency={DEFAULT_CURRENCY} />)
    expect(screen.getByText(/\d/).textContent).toMatch(/0/)
  })

  it('uses DEFAULT_CURRENCY when currency prop is undefined', () => {
    render(<Balance balance={100} />)
    const el = screen.getByText(/\d/)
    expect(el).toBeInTheDocument()
    expect(el.textContent).toContain('100')
  })

  it('renders Skeleton when loading is true', () => {
    const { container } = render(
      <Balance balance={100} currency={DEFAULT_CURRENCY} loading />
    )
    expect(
      container.querySelector('[class*="animate-pulse"]')
    ).toBeInTheDocument()
    expect(screen.queryByText(/100/)).not.toBeInTheDocument()
  })

  it('applies className to the span', () => {
    const { container } = render(
      <Balance
        balance={0}
        currency={DEFAULT_CURRENCY}
        className="custom-class"
      />
    )
    const span = container.querySelector('span.custom-class')
    expect(span).toBeInTheDocument()
  })
})
