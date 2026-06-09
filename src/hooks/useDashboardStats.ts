import { useEffect, useRef, useState } from 'react'
import { getJobStats, DashboardStats, StatsRange } from '@services/job.service'

const POLL_INTERVAL_MS = 10_000

interface UseDashboardStatsResult {
  stats: DashboardStats | null
  loading: boolean
  error: string | null
  lastUpdated: Date | null
}

export function useDashboardStats(range: StatsRange): UseDashboardStatsResult {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    let cancelled = false

    const fetch = async () => {
      if (abortRef.current) abortRef.current.abort()
      abortRef.current = new AbortController()

      try {
        const data = await getJobStats(range)
        if (!cancelled) {
          setStats(data)
          setError(null)
          setLastUpdated(new Date())
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load stats')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    setLoading(true)
    fetch()

    const interval = setInterval(fetch, POLL_INTERVAL_MS)

    return () => {
      cancelled = true
      clearInterval(interval)
      if (abortRef.current) abortRef.current.abort()
    }
  }, [range])

  return { stats, loading, error, lastUpdated }
}
