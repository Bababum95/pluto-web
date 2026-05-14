import Axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios'

import { getAccessToken } from '@/shared/lib/auth/access-token'
import { invalidateSessionAfterUnauthorizedResponse } from '@/shared/lib/auth/invalidate-session-after-unauthorized'

import { API_BASE_URL, ApiError, type ApiErrorBody } from './client'

type PlutoAxiosRequestConfig = InternalAxiosRequestConfig & {
  __plutoSentBearer?: boolean
}

const AXIOS_INSTANCE = Axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

function isAuthLoginOrRegisterSubmit(
  config: InternalAxiosRequestConfig
): boolean {
  const method = (config.method ?? 'get').toLowerCase()
  if (method !== 'post') {
    return false
  }
  const url = config.url ?? ''
  return url.includes('/auth/login') || url.includes('/auth/register')
}

AXIOS_INSTANCE.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = getAccessToken()
    const plutoConfig = config as PlutoAxiosRequestConfig

    if (token) {
      plutoConfig.headers.Authorization = `Bearer ${token}`
      plutoConfig.__plutoSentBearer = true
    }

    return config
  }
)

AXIOS_INSTANCE.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    const status = error.response?.status
    const config = error.config as PlutoAxiosRequestConfig | undefined

    if (
      status === 401 &&
      config?.__plutoSentBearer &&
      !isAuthLoginOrRegisterSubmit(config)
    ) {
      invalidateSessionAfterUnauthorizedResponse()
    }

    return Promise.reject(error)
  }
)

const buildApiError = (error: AxiosError<ApiErrorBody>): ApiError => {
  const status = error.response?.status ?? 500
  const body = error.response?.data
  const messageFromBody = body?.message
  const message =
    typeof messageFromBody === 'string'
      ? messageFromBody
      : Array.isArray(messageFromBody)
        ? messageFromBody[0]
        : error.message

  return new ApiError(status, String(message), body)
}

export const customInstance = async <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig
): Promise<T> => {
  try {
    const response = await AXIOS_INSTANCE({
      ...config,
      ...options,
    })

    return response.data as T
  } catch (error) {
    if (Axios.isAxiosError<ApiErrorBody>(error)) {
      throw buildApiError(error)
    }

    throw error
  }
}

export type ErrorType<Error> = AxiosError<Error>
export type BodyType<BodyData> = BodyData
