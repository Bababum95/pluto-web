import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import { FullScreenLoader } from './full-screen-loader'

describe('FullScreenLoader', () => {
  it('renders nothing when isVisible is false', () => {
    const { container } = render(<FullScreenLoader isVisible={false} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders loader with Pluto image when isVisible is true', () => {
    render(<FullScreenLoader isVisible={true} />)
    expect(screen.getByAltText('Pluto')).toBeInTheDocument()
  })

  it('applies full-screen layout when visible', () => {
    render(<FullScreenLoader isVisible={true} />)
    const img = screen.getByAltText('Pluto')
    const fullScreenWrapper = img.closest('div')?.parentElement
    expect(fullScreenWrapper).toBeTruthy()
    expect(fullScreenWrapper).toHaveClass('min-h-dvh', 'bg-background')
  })
})
