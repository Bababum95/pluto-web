/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

declare const __APP_VERSION__: string
declare const __BUILD_DATE__: string

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_SHOW_DEVTOOLS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
