import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { renderWithProviders } from '@/testing/render'

import { TimeRangeSwitcher } from './TimeRangeSwitcher'

describe('TimeRangeSwitcher (integration)', () => {
  it('changes range type and updates navigation controls', async () => {
    const user = userEvent.setup()
    const { store } = renderWithProviders(<TimeRangeSwitcher />)

    await user.click(screen.getByRole('radio', { name: 'Week' }))

    expect(store.getState().timeRange.type).toBe('week')
    const navigationButtons = screen.getAllByRole('button')
    const nextButton = navigationButtons[0]
    const previousButton = navigationButtons[2]

    expect(previousButton).toBeDisabled()

    await user.click(nextButton)

    await waitFor(() => {
      expect(store.getState().timeRange.index).toBe(1)
    })

    expect(previousButton).toBeEnabled()

    await user.click(previousButton)

    await waitFor(() => {
      expect(store.getState().timeRange.index).toBe(0)
    })

    expect(previousButton).toBeDisabled()
  })

  it('switches to period mode and updates custom range through the picker', async () => {
    const user = userEvent.setup()
    const { store } = renderWithProviders(<TimeRangeSwitcher />, {
      preloadedState: {
        timeRange: {
          type: 'period',
          index: 0,
          range: {
            from: '2026-04-01',
            to: '2026-04-30',
          },
        },
      },
    })

    const pickerButton = screen.getByRole('button', {
      name: /2026-04-01.*2026-04-30/i,
    })
    await user.click(pickerButton)

    const startDay = document.querySelector(
      '[data-day="4/10/2026"]'
    ) as HTMLButtonElement | null
    const endDay = document.querySelector(
      '[data-day="4/15/2026"]'
    ) as HTMLButtonElement | null

    expect(startDay).not.toBeNull()
    expect(endDay).not.toBeNull()

    await user.click(startDay!)
    await user.click(endDay!)

    await waitFor(() => {
      expect(store.getState().timeRange.range).toEqual({
        from: '2026-04-01',
        to: '2026-04-10',
      })
    })
  })
})
