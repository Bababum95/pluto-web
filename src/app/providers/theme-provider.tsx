import { useCallback, useEffect, useState, type ReactNode } from 'react'

import {
  DEFAULT_THEME,
  THEME_STORAGE_KEY,
  THEME_COLOR_LIGHT,
  THEME_COLOR_DARK,
} from '@/shared/config/themes'
import { ThemeContext } from '@/shared/lib/theme/context'
import type { Theme } from '@/shared/lib/theme/types'

function resolveThemeColor(isDark: boolean): string {
  return isDark ? THEME_COLOR_DARK : THEME_COLOR_LIGHT
}

type ThemeProviderProps = {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return DEFAULT_THEME
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null
    return stored || DEFAULT_THEME
  })

  useEffect(() => {
    const root = document.documentElement
    let resolvedDark: boolean

    const applyTheme = (themeValue: Theme) => {
      if (themeValue === 'system') {
        resolvedDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        root.classList.toggle('dark', resolvedDark)
      } else {
        resolvedDark = themeValue === 'dark'
        root.classList.toggle('dark', resolvedDark)
      }
      const meta = document.querySelector('meta[name="theme-color"]')
      if (meta) meta.setAttribute('content', resolveThemeColor(resolvedDark))
    }

    applyTheme(theme)

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem(THEME_STORAGE_KEY, newTheme)
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
