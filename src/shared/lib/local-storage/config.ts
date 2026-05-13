const VALID_MODES = ['dexie', 'api-only'] as const
const DEFAULT_MODE: LocalDataMode = 'api-only'

export type LocalDataMode = (typeof VALID_MODES)[number]

export function getLocalDataMode(): LocalDataMode {
  const t = import.meta.env.VITE_LOCAL_DATA_MODE

  if (!t) return DEFAULT_MODE

  if (VALID_MODES.includes(t as LocalDataMode)) {
    return t as LocalDataMode
  }

  return DEFAULT_MODE
}

export const LOCAL_DATA_MODE: LocalDataMode = getLocalDataMode()
