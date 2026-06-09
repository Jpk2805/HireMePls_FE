import { get, post, delete_ } from '@services/api'
import type { Company, CompanyWatch, CreateCompanyInput } from '@/types/index'

export const getCompany = (id: string): Promise<Company> =>
  get<Company>(`/companies/${id}`)

export const listCompanies = (query?: string, atsType?: string): Promise<Company[]> => {
  const params = new URLSearchParams()
  if (query) params.set('query', query)
  if (atsType) params.set('atsType', atsType)
  const qs = params.toString()
  return get<Company[]>(`/companies${qs ? `?${qs}` : ''}`)
}

export const createCompany = (data: CreateCompanyInput): Promise<Company> =>
  post<Company>('/companies', data)

export const getWatchedCompanies = (): Promise<CompanyWatch[]> =>
  get<CompanyWatch[]>('/companies/watched')

export const watchCompany = (companyId: string): Promise<CompanyWatch> =>
  post<CompanyWatch>('/companies/watch', { companyId })

export const unwatchCompany = (companyId: string): Promise<void> =>
  delete_(`/companies/watch/${companyId}`)
