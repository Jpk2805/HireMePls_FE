// User types
export interface User {
  id: string
  email: string
  name?: string
  plan: 'free' | 'premium'
  createdAt: string
}

// Job types
export type JobStatus = 'pending' | 'active' | 'completed' | 'failed' | 'cancelled'
export type JobType = 'email' | 'pdf' | 'scrape' | 'generic'

export interface Job {
  id: string
  userId: string
  type: JobType
  name?: string
  description?: string
  payload: Record<string, any>
  result?: Record<string, any>
  error?: string
  status: JobStatus
  attempts: number
  maxAttempts: number
  startedAt?: string
  completedAt?: string
  createdAt: string
  updatedAt: string
}

// Job Log types
export interface JobLog {
  id: string
  jobId: string
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
  metadata?: Record<string, any>
  timestamp: string
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Pagination types
export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
}

// Auth types
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name?: string
}

export interface AuthResponse {
  token: string
  user: User
}

// Error types
export interface ApiError {
  error: string
  message: string
  statusCode?: number
  details?: Record<string, any>
}

// Loading states
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

// Context types
export interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name?: string) => Promise<void>
  logout: () => void
  updateUser: (user: User) => void
}
