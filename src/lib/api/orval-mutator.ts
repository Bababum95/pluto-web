import Axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios'

import { getAccessToken } from '@/features/auth/utils/auth-token'

import { API_BASE_URL, ApiError, type ApiErrorBody } from './client'

const AXIOS_INSTANCE = Axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

AXIOS_INSTANCE.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = getAccessToken()

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
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
