import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import type { StorybookConfig } from '@storybook/react-vite'
import type { PluginOption } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

const EXCLUDED_PLUGINS = ['pwa', 'PWA', 'image-optimizer', 'tanstack-router']

function isExcluded(plugin: PluginOption): boolean {
  if (!plugin || typeof plugin === 'boolean') return false
  if (Array.isArray(plugin)) return plugin.some(isExcluded)
  const name = typeof plugin === 'object' && 'name' in plugin ? plugin.name : ''
  return EXCLUDED_PLUGINS.some((p) => name.includes(p))
}

function filterPlugins(plugins: PluginOption[]): PluginOption[] {
  return plugins.reduce<PluginOption[]>((acc, plugin) => {
    if (Array.isArray(plugin)) {
      const filtered = filterPlugins(plugin)
      if (filtered.length > 0) acc.push(filtered)
    } else if (!isExcluded(plugin)) {
      acc.push(plugin)
    }
    return acc
  }, [])
}

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-a11y'],
  framework: '@storybook/react-vite',
  viteFinal(config) {
    config.resolve = config.resolve || {}
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': resolve(__dirname, '../src'),
    }

    if (config.plugins) {
      config.plugins = filterPlugins(config.plugins)
    }

    return config
  },
}

export default config
