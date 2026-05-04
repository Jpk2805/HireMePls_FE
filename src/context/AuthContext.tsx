import React, { createContext, useState, useCallback, useEffect } from 'react'
import * as authService from '@services/auth.service'
import { User, AuthContextType } from '@types/index'
import toast from 'react-hot-toast'

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = authService.getToken()
    const storedUser = authService.getCurrentUser()

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(storedUser)
    }

    setIsLoading(false)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const response = await authService.login({ email, password })

      authService.storeAuth(response.token, response.user)
      setToken(response.token)
      setUser(response.user)

      toast.success('Login successful!')
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed'
      toast.error(message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const register = useCallback(
    async (email: string, password: string, name?: string) => {
      try {
        setIsLoading(true)
        const response = await authService.register({ email, password, name })

        authService.storeAuth(response.token, response.user)
        setToken(response.token)
        setUser(response.user)

        toast.success('Account created successfully!')
      } catch (error: any) {
        const message = error.response?.data?.message || 'Registration failed'
        toast.error(message)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const logout = useCallback(() => {
    authService.logout()
    setToken(null)
    setUser(null)
    toast.success('Logged out successfully!')
  }, [])

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }, [])

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
