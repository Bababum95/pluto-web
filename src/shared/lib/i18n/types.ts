/**
 * Recursively builds a union of dot-separated keys from a nested translation object.
 * Use for typing props that accept translation keys (e.g. label: TranslationKey).
 */
import type en from './locales/en.json'
import { SUPPORTED_LANGUAGES } from './config'

type FlattenKeys<T, Prefix extends string = ''> =
  T extends Record<string, unknown>
    ? {
        [K in keyof T]: T[K] extends Record<string, unknown>
          ? FlattenKeys<T[K], `${Prefix}${K & string}.`>
          : `${Prefix}${K & string}`
      }[keyof T] extends infer R
      ? R extends string
        ? R
        : never
      : never
    : never

/** All valid translation keys (dot notation). Source of truth: en.json */
export type TranslationKey = FlattenKeys<typeof en>
export type SupportedLanguages = (typeof SUPPORTED_LANGUAGES)[number]
