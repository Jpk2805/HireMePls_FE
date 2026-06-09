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

// ─── Job Board ────────────────────────────────────────────────────────────────

export interface ParsedDescription {
  responsibilities: string[]
  requirements: string[]
  niceToHave: string[]
  benefits: string[]
  aboutCompany: string
  salary: string | null
}

export interface JobPostingItem {
  id: string
  title: string
  company: string
  companyId?: string
  locations: string[]
  url: string
  source: string
  postedAt?: string
  contentHash: string
  descriptionRaw: string
  descriptionParsed?: ParsedDescription
  technologiesReq?: string[]
  technologiesNice?: string[]
  experienceLevel?: string
  workMode?: string
  jobType?: string
  yearsRequired?: number
  salaryMin?: number
  salaryMax?: number
  salaryCurrency?: string
  savedSearchId?: string
  createdAt: string
  updatedAt: string
  matchScore: number | null
  reasoning: string | null
  userFeedback: 'interested' | 'not_interested' | 'applied' | null
}

export interface JobPostingFilters {
  page?: number
  limit?: number
  experienceLevel?: string
  workMode?: string
  jobType?: string
  technologies?: string
  minScore?: number
  locations?: string
  query?: string
  source?: string
  postedAfter?: string
  postedBefore?: string
  sortBy?: 'score' | 'postedAt' | 'salaryMin' | 'createdAt'
  sortDir?: 'asc' | 'desc'
}

export interface PaginatedJobPostings {
  postings: JobPostingItem[]
  total: number
  page: number
  limit: number
  pages: number
}

// ─── Saved Searches ───────────────────────────────────────────────────────────

export type ScrapeSource =
  | 'linkedin'
  | 'indeed'
  | 'glassdoor'
  | 'greenhouse'
  | 'lever'
  | 'ashby'
  | 'workable'
  | 'smartrecruiters'

export interface SavedSearch {
  id: string
  userId: string
  name: string
  query: string
  locations: string[]
  sources: ScrapeSource[]
  cronExpr?: string
  isActive: boolean
  lastRunAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateSavedSearchInput {
  name: string
  query: string
  locations: string[]
  sources: ScrapeSource[]
  cronExpr?: string
}

// ─── Companies ────────────────────────────────────────────────────────────────

export type AtsType =
  | 'greenhouse'
  | 'lever'
  | 'ashby'
  | 'workable'
  | 'smartrecruiters'
  | 'bamboohr'
  | 'custom'

export interface Company {
  id: string
  name: string
  domain?: string
  logoUrl?: string
  atsType?: AtsType
  atsSlug?: string
  careerUrl?: string
  isActive: boolean
  autoCreated: boolean
  createdAt: string
}

export interface CompanyWatch {
  id: string
  userId: string
  companyId: string
  createdAt: string
  company: Company
}

export interface CreateCompanyInput {
  name: string
  domain?: string
  atsType: AtsType
  atsSlug?: string
  careerUrl?: string
}
