import { useEffect, useState, useCallback, type FC } from 'react'

import { ThemeContext } from '../ThemeContext'
import { DEFAULT_THEME, THEME_STORAGE_KEY } from '../constants'
import type { Theme } from '../types'

type Props = {
  children: React.ReactNode
}

export const ThemeProvider: FC<Props> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return DEFAULT_THEME
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null
    return stored || DEFAULT_THEME
  })

  useEffect(() => {
    const root = document.documentElement
    const applyTheme = (themeValue: Theme) => {
      if (themeValue === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
          .matches
          ? 'dark'
          : 'light'
        root.classList.toggle('dark', systemTheme === 'dark')
      } else {
        root.classList.toggle('dark', themeValue === 'dark')
      }
    }

    applyTheme(theme)

    // Listen for system theme changes
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
