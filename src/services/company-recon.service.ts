import { get, post } from '@services/api'

export interface ReconData {
  funding: string | null
  techStack: string[]
  news: string[]
  headcount: string | null
  glassdoorRating: number | null
}

export const getRecon = (companyId: string): Promise<{ recon: ReconData | null; reconStatus: string | null; reconAt: string | null }> =>
  get(`/companies/${companyId}/recon`)

export const refreshRecon = (companyId: string): Promise<{ message: string }> =>
  post(`/companies/${companyId}/recon/refresh`)
