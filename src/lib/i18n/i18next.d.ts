/**
 * Type-safe translations: keys are inferred from the default locale (en).
 * Augments i18next so that t() only accepts valid translation keys.
 */
import 'i18next'
import type en from './locales/en.json'

declare module 'i18next' {
  interface CustomTypeOptions {
    strictKeyChecks: true
    resources: {
      translation: typeof en
    }
  }
}
