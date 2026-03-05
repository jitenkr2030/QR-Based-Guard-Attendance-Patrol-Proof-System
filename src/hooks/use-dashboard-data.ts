import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface DashboardStats {
  totalGuards: number
  activeSites: number
  todayAttendance: number
  patrolCompletion: number
  lateCheckins: number
  missedPatrols: number
}

interface AttendanceRecord {
  id: string
  guardName: string
  siteName: string
  type: 'CHECK_IN' | 'CHECK_OUT'
  timestamp: string
  location: string
}

interface Guard {
  id: string
  name: string
  email: string
  employeeId: string
  department?: string
  isActive: boolean
  phone?: string
  assignments: {
    site: {
      name: string
      address: string
    }
  }[]
  _count: {
    attendances: number
    patrols: number
  }
}

interface Site {
  id: string
  name: string
  address: string
  client: {
    companyName: string
  }
  supervisor?: {
    user: {
      name: string
      email: string
    }
  }
  _count: {
    qrCodes: number
    assignments: number
    attendances: number
  }
}

export function useDashboardData() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (session?.user) {
      fetchDashboardData()
    }
  }, [session])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch dashboard stats
      const statsResponse = await fetch('/api/dashboard/stats')
      if (!statsResponse.ok) throw new Error('Failed to fetch stats')
      const statsData = await statsResponse.json()

      // Fetch recent activity
      const activityResponse = await fetch('/api/dashboard/activity')
      if (!activityResponse.ok) throw new Error('Failed to fetch activity')
      const activityData = await activityResponse.json()

      setStats(statsData)
      setRecentActivity(activityData)
    } catch (error) {
      console.error('Dashboard data fetch error:', error)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  return { stats, recentActivity, loading, error, refetch: fetchDashboardData }
}

export function useGuards() {
  const [guards, setGuards] = useState<Guard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGuards = async (siteId?: string, isActive?: boolean) => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (siteId) params.append('siteId', siteId)
      if (isActive !== undefined) params.append('isActive', isActive.toString())
      
      const response = await fetch(`/api/guards?${params}`)
      if (!response.ok) throw new Error('Failed to fetch guards')
      
      const data = await response.json()
      setGuards(data)
    } catch (error) {
      console.error('Guards fetch error:', error)
      setError('Failed to load guards')
    } finally {
      setLoading(false)
    }
  }

  const createGuard = async (guardData: any) => {
    try {
      const response = await fetch('/api/guards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(guardData)
      })
      
      if (!response.ok) throw new Error('Failed to create guard')
      
      const newGuard = await response.json()
      setGuards(prev => [...prev, newGuard])
      return newGuard
    } catch (error) {
      console.error('Create guard error:', error)
      throw error
    }
  }

  return { guards, loading, error, fetchGuards, createGuard }
}

export function useSites() {
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSites = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/sites')
      if (!response.ok) throw new Error('Failed to fetch sites')
      
      const data = await response.json()
      setSites(data)
    } catch (error) {
      console.error('Sites fetch error:', error)
      setError('Failed to load sites')
    } finally {
      setLoading(false)
    }
  }

  const createSite = async (siteData: any) => {
    try {
      const response = await fetch('/api/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteData)
      })
      
      if (!response.ok) throw new Error('Failed to create site')
      
      const newSite = await response.json()
      setSites(prev => [...prev, newSite])
      return newSite
    } catch (error) {
      console.error('Create site error:', error)
      throw error
    }
  }

  return { sites, loading, error, fetchSites, createSite }
}

export function useAttendance() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAttendance = async (siteId?: string, guardId?: string, startDate?: string, endDate?: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (siteId) params.append('siteId', siteId)
      if (guardId) params.append('guardId', guardId)
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      
      const response = await fetch(`/api/attendance?${params}`)
      if (!response.ok) throw new Error('Failed to fetch attendance')
      
      const data = await response.json()
      setAttendance(data)
    } catch (error) {
      console.error('Attendance fetch error:', error)
      setError('Failed to load attendance data')
    } finally {
      setLoading(false)
    }
  }

  return { attendance, loading, error, fetchAttendance }
}

export function useReports() {
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateReport = async (reportType: string, startDate: string, endDate: string, format: 'json' | 'pdf' = 'json', siteId?: string, guardId?: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        reportType,
        startDate,
        endDate,
        format,
        ...(siteId && { siteId }),
        ...(guardId && { guardId })
      })
      
      const response = await fetch(`/api/reports?${params}`)
      if (!response.ok) throw new Error('Failed to generate report')
      
      if (format === 'pdf') {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${reportType}_${startDate}_${endDate}.pdf`
        a.click()
        window.URL.revokeObjectURL(url)
      } else {
        const data = await response.json()
        setReports(prev => [...prev, data])
        return data
      }
    } catch (error) {
      console.error('Report generation error:', error)
      setError('Failed to generate report')
      throw error
    } finally {
      setLoading(false)
    }
  }

  return { reports, loading, error, generateReport }
}