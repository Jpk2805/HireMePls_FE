import { apiClient } from './api'
import { User } from '@/types/index'

export interface RegisterPayload {
  email: string
  password: string
  name?: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  user: User
}

/**
 * Register new user
 */
export const register = async (payload: RegisterPayload): Promise<AuthResponse> => {
  const response = await apiClient.post('/auth/register', payload)
  return response.data
}

/**
 * Login user
 */
export const login = async (payload: LoginPayload): Promise<AuthResponse> => {
  const response = await apiClient.post('/auth/login', payload)
  return response.data
}

/**
 * Logout user (client-side only)
 */
export const logout = (): void => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

/**
 * Get current user from localStorage
 */
export const getCurrentUser = (): User | null => {
  const userJson = localStorage.getItem('user')
  if (!userJson) return null

  try {
    return JSON.parse(userJson)
  } catch {
    return null
  }
}

/**
 * Get stored token
 */
export const getToken = (): string | null => {
  return localStorage.getItem('token')
}

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!getToken()
}

/**
 * Store auth data
 */
export const storeAuth = (token: string, user: User): void => {
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
}

/**
 * Verify token (refresh/validate)
 */
export const verifyToken = async (): Promise<boolean> => {
  try {
    const token = getToken()
    if (!token) return false

    const response = await apiClient.post('/auth/verify', { token })
    return response.data.valid
  } catch {
    return false
  }
}

/**
 * Request password reset
 */
export const requestPasswordReset = async (email: string): Promise<{ message: string }> => {
  const response = await apiClient.post('/auth/forgot-password', { email })
  return response.data
}

/**
 * Reset password with token
 */
export const resetPassword = async (
  token: string,
  newPassword: string
): Promise<{ message: string }> => {
  const response = await apiClient.post('/auth/reset-password', {
    token,
    newPassword,
  })
  return response.data
}

/**
 * Update profile (name)
 */
export const updateProfile = async (payload: { name?: string }): Promise<User> => {
  const response = await apiClient.patch('/auth/me', payload)
  return response.data
}

/**
 * Change password (authenticated)
 */
export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<{ message: string }> => {
  const response = await apiClient.post('/auth/change-password', {
    currentPassword,
    newPassword,
  })
  return response.data
}

export default {
  register,
  login,
  logout,
  getCurrentUser,
  getToken,
  isAuthenticated,
  storeAuth,
  verifyToken,
  requestPasswordReset,
  resetPassword,
  changePassword,
  updateProfile,
}
