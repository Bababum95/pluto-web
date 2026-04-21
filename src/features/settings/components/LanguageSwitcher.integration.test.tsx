import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import { renderWithProviders } from '@/testing/render'
import { i18n } from '@/lib/i18n'

import { LanguageSwitcher } from './LanguageSwitcher'

describe('LanguageSwitcher (integration)', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en')
  })

  it('opens language menu and switches the active language', async () => {
    const user = userEvent.setup()

    renderWithProviders(<LanguageSwitcher />)

    await user.click(
      screen.getByRole('button', { name: 'Change language' })
    )

    await user.click(screen.getByRole('menuitemradio', { name: 'Русский' }))

    expect(i18n.language).toBe('ru')
  })
})
