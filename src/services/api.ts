import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios'

// Get API configuration from environment
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT
  ? parseInt(import.meta.env.VITE_API_TIMEOUT)
  : 10000

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - Add token to headers
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error: AxiosError) => {
    // Handle specific error codes
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }

    if (error.response?.status === 403) {
      // Forbidden - access denied
      console.error('Access forbidden')
    }

    if (error.response?.status === 429) {
      // Rate limited
      console.error('Rate limit exceeded')
    }

    return Promise.reject(error)
  }
)

/**
 * API response type
 */
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

/**
 * Generic API call wrapper
 */
export const apiCall = async <T = any>(
  method: string,
  endpoint: string,
  data?: any,
  config?: any
): Promise<T> => {
  try {
    const response = await apiClient({
      method,
      url: endpoint,
      data,
      ...config,
    })

    return response.data as T
  } catch (error) {
    throw error
  }
}

/**
 * GET request
 */
export const get = <T = any>(endpoint: string, config?: any): Promise<T> => {
  return apiCall('GET', endpoint, undefined, config)
}

/**
 * POST request
 */
export const post = <T = any>(
  endpoint: string,
  data?: any,
  config?: any
): Promise<T> => {
  return apiCall('POST', endpoint, data, config)
}

/**
 * PUT request
 */
export const put = <T = any>(
  endpoint: string,
  data?: any,
  config?: any
): Promise<T> => {
  return apiCall('PUT', endpoint, data, config)
}

/**
 * PATCH request
 */
export const patch = <T = any>(
  endpoint: string,
  data?: any,
  config?: any
): Promise<T> => {
  return apiCall('PATCH', endpoint, data, config)
}

/**
 * DELETE request
 */
export const delete_ = <T = any>(endpoint: string, config?: any): Promise<T> => {
  return apiCall('DELETE', endpoint, undefined, config)
}

export default {
  apiClient,
  get,
  post,
  put,
  patch,
  delete: delete_,
}
