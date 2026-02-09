export const FALLBACK_URL = '/'
export const LOGIN_URL = '/login'
export const REGISTER_URL = '/register'
export const PASSWORD_MIN_LENGTH = 6
export const TOKEN_COOKIE_NAME =
  import.meta.env.VITE_TOKEN_ACCESS_COOKIE_NAME || 'access_token'
const MAX_AGE_DAYS = import.meta.env.VITE_TOKEN_MAX_AGE_DAYS || 7
export const MAX_AGE_SEC = MAX_AGE_DAYS * 24 * 60 * 60
