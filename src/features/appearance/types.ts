export type Appearance = 'classic' | 'liquid'

export type AppearanceContextType = {
  appearance: Appearance
  setAppearance: (appearance: Appearance) => void
}
