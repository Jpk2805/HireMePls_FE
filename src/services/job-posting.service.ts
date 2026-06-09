import { get, post, patch } from '@services/api'
import type { JobPostingItem, JobPostingFilters, PaginatedJobPostings } from '@/types/index'

export const listJobPostings = (filters: JobPostingFilters = {}): Promise<PaginatedJobPostings> => {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== '') params.set(k, String(v))
  })
  return get<PaginatedJobPostings>(`/job-postings?${params.toString()}`)
}

export const getJobPosting = (id: string): Promise<JobPostingItem> =>
  get<JobPostingItem>(`/job-postings/${id}`)

export const triggerResume = (id: string): Promise<{ jobId: string; message: string; jobPostingId: string }> =>
  post(`/job-postings/${id}/resume`)

export const setFeedback = (
  id: string,
  feedback: 'interested' | 'not_interested' | 'applied' | null
): Promise<{ message: string; feedback: string | null }> =>
  patch(`/job-postings/${id}/feedback`, { feedback })

export const resolveCompany = (id: string): Promise<{ companyId: string | null }> =>
  post(`/job-postings/${id}/resolve-company`)

export interface JobBoardStats {
  totalScored: number
  avgScore: number | null
  scoreDistribution: { bracket: string; count: number }[]
  bySource: { source: string; count: number; avgScore: number | null }[]
  topMatches: { id: string; title: string; company: string; score: number; source: string }[]
}

export const getJobBoardStats = (): Promise<JobBoardStats> =>
  get<JobBoardStats>('/job-postings/stats')
