export const THEME_CLASSNAMES = { light: "", dark: ".dark" } as const;
export const TIME_RANGES = ["day", "week", "month", "year", "period"] as const;
export const LANGUAGES = ["en", "ru"] as const;
export const THEMES = ["light", "dark", "system"] as const;
export const MENU_ITEMS = [
  { label: "common.home", to: "/" },
  { label: "common.about", to: "/about" },
  { label: "common.settings", to: "/settings" },
] as const;
