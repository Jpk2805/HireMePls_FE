import { useState, useCallback } from 'react'
import * as jobService from '@services/job.service'
import { Job, PaginatedResponse } from '@/types/index'
import toast from 'react-hot-toast'

export const useJob = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const stats = await jobService.getJobStats()
      return stats
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to fetch job stats'
      setError(message)
      toast.error(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchJobs = useCallback(async (filters?: any): Promise<PaginatedResponse<Job>> => {
    setLoading(true)
    setError(null)
    try {
      const jobs = await jobService.listJobs(filters)
      return jobs
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to fetch jobs'
      setError(message)
      toast.error(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchJob = useCallback(async (jobId: string): Promise<Job> => {
    setLoading(true)
    setError(null)
    try {
      const job = await jobService.getJob(jobId)
      return job
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to fetch job'
      setError(message)
      toast.error(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const create = useCallback(async (payload: jobService.CreateJobPayload): Promise<Job> => {
    setLoading(true)
    setError(null)
    try {
      const job = await jobService.createJob(payload)
      toast.success('Job created successfully!')
      return job
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to create job'
      setError(message)
      toast.error(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const cancel = useCallback(async (jobId: string) => {
    setLoading(true)
    setError(null)
    try {
      const result = await jobService.cancelJob(jobId)
      toast.success('Job cancelled')
      return result
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to cancel job'
      setError(message)
      toast.error(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const retry = useCallback(async (jobId: string): Promise<Job> => {
    setLoading(true)
    setError(null)
    try {
      const job = await jobService.retryJob(jobId)
      toast.success('Job retried successfully!')
      return job
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to retry job'
      setError(message)
      toast.error(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    fetchStats,
    fetchJobs,
    fetchJob,
    create,
    cancel,
    retry,
  }
}
