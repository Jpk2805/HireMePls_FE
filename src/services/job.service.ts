import { apiClient } from './api'
import { Job, PaginatedResponse, PaginationParams } from '@/types/index'

export type StatsRange = '24h' | '7d' | '30d'

export interface DashboardStats {
  counts: {
    total: number
    pending: number
    active: number
    completed: number
    failed: number
    cancelled: number
  }
  byType: Record<string, number>
  successRate: number
  avgDurationMs: number
  timeSeries: Array<{ label: string; completed: number; failed: number; total: number }>
  recentJobs: Array<{
    id: string
    name: string | null
    type: string
    status: string
    createdAt: string
    duration: number | null
  }>
}

export interface CreateJobPayload {
  type: 'email' | 'pdf' | 'scrape' | 'generic' | 'resume'
  name?: string
  payload: Record<string, any>
}

export interface JobFilters extends PaginationParams {
  status?: string
  type?: string
}

/**
 * Get dashboard statistics
 */
export const getJobStats = async (range: StatsRange = '7d'): Promise<DashboardStats> => {
  const response = await apiClient.get(`/jobs/stats?range=${range}`)
  return response.data.data
}

/**
 * Get all jobs with pagination
 */
export const listJobs = async (filters: JobFilters = {}): Promise<PaginatedResponse<Job>> => {
  const params = new URLSearchParams()
  if (filters.page) params.append('page', String(filters.page))
  if (filters.limit) params.append('limit', String(filters.limit))
  if (filters.status) params.append('status', filters.status)
  if (filters.type) params.append('type', filters.type)
  if (filters.sortBy) params.append('sortBy', filters.sortBy)
  if (filters.sortOrder) params.append('sortOrder', filters.sortOrder)

  const response = await apiClient.get(`/jobs?${params.toString()}`)
  return response.data
}

/**
 * Get single job by ID
 */
export const getJob = async (jobId: string): Promise<Job> => {
  const response = await apiClient.get(`/jobs/${jobId}`)
  return response.data
}

/**
 * Create new job
 */
export const createJob = async (payload: CreateJobPayload): Promise<Job> => {
  const response = await apiClient.post('/jobs', payload)
  return response.data
}

/**
 * Cancel job
 */
export const cancelJob = async (jobId: string): Promise<{ message: string }> => {
  const response = await apiClient.delete(`/jobs/${jobId}`)
  return response.data
}

/**
 * Retry failed job
 */
export const retryJob = async (jobId: string): Promise<Job> => {
  const response = await apiClient.post(`/jobs/${jobId}/retry`)
  return response.data
}

export default {
  getJobStats,
  listJobs,
  getJob,
  createJob,
  cancelJob,
  retryJob,
}
