import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { SvgIcon, SvgIconProps } from './types'
import {
  DEFAULT_ICON,
  ICON_CATEGORIES,
  ICON_REGISTRY,
  POPULAR_ICONS,
  getIconByName,
  isIconName,
  type IconName,
} from './registry'

type IconEntry = [IconName, SvgIcon]

function renderIcon(Icon: SvgIcon, props?: SvgIconProps) {
  const view = render(<Icon {...props} />)
  const svg = view.container.querySelector('svg')

  if (!svg) {
    throw new Error('Icon did not render an svg element')
  }

  return { svg, unmount: view.unmount }
}

describe('icon registry', () => {
  it('renders each registered icon and resolves names correctly', () => {
    const iconEntries = Object.entries(ICON_REGISTRY) as IconEntry[]

    for (const [name, Icon] of iconEntries) {
      const defaultRender = renderIcon(Icon)
      expect(defaultRender.svg).toHaveAttribute('width')
      expect(defaultRender.svg).toHaveAttribute('height')
      const defaultWidth = Number.parseFloat(
        defaultRender.svg.getAttribute('width') ?? '0'
      )
      const defaultHeight = Number.parseFloat(
        defaultRender.svg.getAttribute('height') ?? '0'
      )
      defaultRender.unmount()

      const customRender = renderIcon(Icon, {
        size: 16,
        className: 'custom-icon',
      })
      const customWidth = Number.parseFloat(
        customRender.svg.getAttribute('width') ?? '0'
      )
      const customHeight = Number.parseFloat(
        customRender.svg.getAttribute('height') ?? '0'
      )
      expect(customWidth).toBeGreaterThan(0)
      expect(customHeight).toBeGreaterThan(0)
      expect(customWidth).not.toBe(defaultWidth)
      expect(customHeight).not.toBe(defaultHeight)
      expect(customRender.svg).toHaveClass('custom-icon')
      customRender.unmount()

      expect(getIconByName(name)).toBe(Icon)
      expect(isIconName(name)).toBe(true)
    }
  })

  it('keeps exported icon groups aligned with the registry', () => {
    for (const category of ICON_CATEGORIES) {
      expect(category.icons.length).toBeGreaterThan(0)

      for (const iconName of category.icons) {
        expect(isIconName(iconName)).toBe(true)
        expect(getIconByName(iconName)).toBeDefined()
      }
    }

    for (const iconName of POPULAR_ICONS) {
      expect(isIconName(iconName)).toBe(true)
      expect(getIconByName(iconName)).toBeDefined()
    }

    expect(DEFAULT_ICON).toBe(ICON_REGISTRY.Dollar01Icon)
    expect(getIconByName()).toBeUndefined()
    expect(getIconByName('missing-icon')).toBeUndefined()
    expect(isIconName('missing-icon')).toBe(false)
  })
})
