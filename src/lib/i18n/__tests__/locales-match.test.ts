import { describe, expect, it } from 'vitest'

import en from '../locales/en.json'
import ru from '../locales/ru.json'

type LocaleObject = Record<string, string | LocaleObject>

const locales: Record<string, LocaleObject> = { en, ru }
const localeNames = Object.keys(locales)

function getKeys(obj: LocaleObject, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'object' && value !== null) {
      return getKeys(value as LocaleObject, fullKey)
    }
    return fullKey
  })
}

describe('Locale files comparison', () => {
  const keysByLocale = Object.fromEntries(
    localeNames.map((name) => [name, new Set(getKeys(locales[name]))])
  )

  for (const source of localeNames) {
    for (const target of localeNames) {
      if (source === target) continue

      it(`all keys from "${source}" must exist in "${target}"`, () => {
        const sourceKeys = keysByLocale[source]
        const targetKeys = keysByLocale[target]

        const missingKeys = [...sourceKeys].filter((key) => !targetKeys.has(key))

        expect(missingKeys, `Keys missing in "${target}" locale`).toEqual([])
      })
    }
  }

  it('all locales must have the same number of keys', () => {
    const counts = localeNames.map((name) => ({
      locale: name,
      count: keysByLocale[name].size,
    }))

    const first = counts[0]
    for (const entry of counts.slice(1)) {
      expect(entry.count, `"${entry.locale}" has ${entry.count} keys, "${first.locale}" has ${first.count}`).toBe(
        first.count
      )
    }
  })
})
