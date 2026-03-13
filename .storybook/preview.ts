import type { Preview } from '@storybook/react-vite'
import { createElement, Fragment, type ReactNode } from 'react'

import '../src/index.css'
import '../src/lib/i18n/config'

/** Applies theme class to document so CSS variables (e.g. .dark in index.css) take effect. */
function ThemeDecorator(
  Story: () => ReactNode,
  context: { globals: { theme?: string } }
) {
  const theme = context.globals.theme ?? 'light'
  const isDark = theme === 'dark'

  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', isDark)
  }

  return createElement(Fragment, null, Story())
}

const preview: Preview = {
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [ThemeDecorator],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
}

export default preview
