import { apiClient } from './api'
import { PaginatedResponse, PaginationParams } from '@types/index'

export interface Resume {
  id: string
  userId: string
  jobPostingUrl?: string
  workHistory?: string
  sections?: Record<string, any>
  pdfUrl?: string
  status: 'pending' | 'completed' | 'failed'
  createdAt: string
  updatedAt: string
}

export interface ResumeFilters extends PaginationParams {}

/**
 * Get all resumes with pagination
 */
export const listResumes = async (filters: ResumeFilters = {}): Promise<PaginatedResponse<Resume>> => {
  const params = new URLSearchParams()
  if (filters.page) params.append('page', String(filters.page))
  if (filters.limit) params.append('limit', String(filters.limit))

  const response = await apiClient.get(`/resumes?${params.toString()}`)
  return response.data
}

/**
 * Get single resume by ID
 */
export const getResume = async (resumeId: string): Promise<Resume> => {
  const response = await apiClient.get(`/resumes/${resumeId}`)
  return response.data
}

/**
 * Create new resume (trigger generation job)
 */
export const createResume = async (payload: {
  jobPostingUrl: string
  workHistory: string
}): Promise<Resume> => {
  const response = await apiClient.post('/resumes', payload)
  return response.data
}

/**
 * Delete resume
 */
export const deleteResume = async (resumeId: string): Promise<{ message: string }> => {
  const response = await apiClient.delete(`/resumes/${resumeId}`)
  return response.data
}

export default {
  listResumes,
  getResume,
  createResume,
  deleteResume,
}
