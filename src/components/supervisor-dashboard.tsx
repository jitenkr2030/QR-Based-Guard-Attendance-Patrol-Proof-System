'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Users, 
  MapPin, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Eye,
  MessageSquare,
  Calendar,
  BarChart3,
  Activity,
  RefreshCw,
  Bell
} from 'lucide-react'
import { useDashboardData } from '@/hooks/use-dashboard-data'

interface GuardPerformance {
  id: string
  name: string
  email: string
  employeeId: string
  attendanceRate: number
  punctualityRate: number
  totalShifts: number
  presentDays: number
  lateDays: number
  totalPatrols: number
  missedPatrols: number
}

interface SiteMetrics {
  id: string
  name: string
  address: string
  totalGuards: number
  presentGuards: number
  attendanceRate: number
  patrolCompletion: number
  lastActivity: string
  issues: string[]
}

export default function SupervisorDashboard() {
  const { data: session } = useSession()
  const { stats, recentActivity, loading, error, refetch } = useDashboardData()
  const [guardPerformance, setGuardPerformance] = useState<GuardPerformance[]>([])
  const [siteMetrics, setSiteMetrics] = useState<SiteMetrics[]>([])
  const [alerts, setAlerts] = useState<any[]>([])

  useEffect(() => {
    if (session?.user?.role === 'SUPERVISOR') {
      fetchSupervisorData()
    }
  }, [session])

  const fetchSupervisorData = async () => {
    try {
      // Fetch guard performance
      const performanceResponse = await fetch('/api/reports?reportType=GUARD_PERFORMANCE&startDate=2024-01-01&endDate=2024-12-31')
      if (performanceResponse.ok) {
        const performanceData = await performanceResponse.json()
        setGuardPerformance(performanceData.data || [])
      }

      // Fetch site metrics
      const sitesResponse = await fetch('/api/sites')
      if (sitesResponse.ok) {
        const sitesData = await sitesResponse.json()
        const metrics = sitesData.map((site: any) => ({
          id: site.id,
          name: site.name,
          address: site.address,
          totalGuards: site._count?.assignments || 0,
          presentGuards: Math.floor((site._count?.assignments || 0) * 0.8), // Simulated
          attendanceRate: 85, // Simulated
          patrolCompletion: 78, // Simulated
          lastActivity: new Date().toISOString(),
          issues: [] // Simulated
        }))
        setSiteMetrics(metrics)
      }

      // Simulate alerts
      setAlerts([
        {
          id: '1',
          type: 'late_checkin',
          message: 'John Doe was late for check-in at Main Office',
          severity: 'warning',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          type: 'missed_patrol',
          message: '2 missed patrols detected at Warehouse Facility',
          severity: 'error',
          timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          type: 'low_attendance',
          message: 'Low attendance rate (75%) at ABC Corporate Office',
          severity: 'warning',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        }
      ])
    } catch (error) {
      console.error('Error fetching supervisor data:', error)
    }
  }

  const getPerformanceColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600'
    if (rate >= 75) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getPerformanceIcon = (rate: number) => {
    if (rate >= 90) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (rate >= 75) return <Activity className="h-4 w-4 text-yellow-500" />
    return <TrendingDown className="h-4 w-4 text-red-500" />
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'late_checkin':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'missed_patrol':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'low_attendance':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'border-red-200 bg-red-50'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50'
      case 'info':
        return 'border-blue-200 bg-blue-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  if (session?.user?.role !== 'SUPERVISOR') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
              <p className="text-gray-600">This page is only accessible to supervisors.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Supervisor Dashboard</h1>
                <p className="text-sm text-gray-500">Monitor your assigned sites and guards</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={refetch} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact Admin
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {/* Critical Alerts */}
        {alerts.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Critical Alerts</h2>
            <div className="space-y-3">
              {alerts.slice(0, 3).map((alert) => (
                <Alert key={alert.id} className={getAlertColor(alert.severity)}>
                  <div className="flex items-center space-x-2">
                    {getAlertIcon(alert.type)}
                    <AlertDescription className="flex-1">
                      <div className="font-medium">{alert.message}</div>
                      <div className="text-xs opacity-75">
                        {new Date(alert.timestamp).toLocaleString()}
                      </div>
                    </AlertDescription>
                    <Button variant="outline" size="sm">
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </Alert>
              ))}
            </div>
          </div>
        )}

        {/* Overview Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Guards on Duty</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : stats?.totalGuards || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.todayAttendance || 0} present today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : '85%'}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.lateCheckins && stats.lateCheckins > 0 ? 
                  `${stats.lateCheckins} late today` : 'All on time'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Patrol Completion</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : `${stats?.patrolCompletion || 0}%`}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.missedPatrols && stats.missedPatrols > 0 ? 
                  `${stats.missedPatrols} missed` : 'On track'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sites</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{siteMetrics.length}</div>
              <p className="text-xs text-muted-foreground">
                Under your supervision
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="guards">Guards</TabsTrigger>
            <TabsTrigger value="sites">Sites</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Guard Performance Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Guard Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {guardPerformance.slice(0, 5).map((guard) => (
                      <div key={guard.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{guard.name}</div>
                          <div className="text-sm text-gray-500">{guard.employeeId}</div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            {getPerformanceIcon(parseInt(guard.attendanceRate))}
                            <span className={`text-sm font-medium ${getPerformanceColor(parseInt(guard.attendanceRate))}`}>
                              {guard.attendanceRate}%
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {guard.presentDays}/{guard.totalShifts} days
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Site Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Site Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {siteMetrics.map((site) => (
                      <div key={site.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{site.name}</div>
                          <div className="text-sm text-gray-500">{site.address}</div>
                          <div className="flex items-center space-x-2 mt-1">
                            <Users className="h-3 w-3 text-gray-400" />
                            <span className="text-xs">{site.presentGuards}/{site.totalGuards} guards</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-medium ${getPerformanceColor(site.attendanceRate)}`}>
                            {site.attendanceRate}%
                          </div>
                          <div className="text-xs text-gray-500">
                            {site.patrolCompletion}% patrols
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="guards">
            <Card>
              <CardHeader>
                <CardTitle>Guard Performance Details</CardTitle>
                <CardDescription>Detailed performance metrics for all guards</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Guard</TableHead>
                        <TableHead>Employee ID</TableHead>
                        <TableHead>Attendance</TableHead>
                        <TableHead>Punctuality</TableHead>
                        <TableHead>Shifts</TableHead>
                        <TableHead>Patrols</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {guardPerformance.map((guard) => (
                        <TableRow key={guard.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                <span className="text-xs font-medium">
                                  {guard.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium">{guard.name}</div>
                                <div className="text-sm text-gray-500">{guard.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{guard.employeeId}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getPerformanceIcon(guard.attendanceRate)}
                              <span className={`text-sm font-medium ${getPerformanceColor(guard.attendanceRate)}`}>
                                {guard.attendanceRate}%
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {guard.presentDays}/{guard.totalShifts}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getPerformanceIcon(guard.punctualityRate)}
                              <span className={`text-sm font-medium ${getPerformanceColor(guard.punctualityRate)}`}>
                                {guard.punctualityRate}%
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {guard.lateDays} late
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{guard.totalShifts} shifts</div>
                              <div className="text-gray-500">{guard.totalPatrols} patrols</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{guard.missedPatrols} missed</div>
                              <div className="text-gray-500">{guard.totalPatrols - guard.missedPatrols} completed</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {guard.attendanceRate >= 90 ? (
                              <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                            ) : guard.attendanceRate >= 75 ? (
                              <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800">Needs Attention</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sites">
            <Card>
              <CardHeader>
                <CardTitle>Site Management</CardTitle>
                <CardDescription>Monitor and manage your assigned sites</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {siteMetrics.map((site) => (
                    <Card key={site.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{site.name}</CardTitle>
                        <CardDescription>{site.address}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Guards Present</span>
                            <span className="font-medium">{site.presentGuards}/{site.totalGuards}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Attendance Rate</span>
                            <span className={`font-medium ${getPerformanceColor(site.attendanceRate)}`}>
                              {site.attendanceRate}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Patrol Completion</span>
                            <span className={`font-medium ${getPerformanceColor(site.patrolCompletion)}`}>
                              {site.patrolCompletion}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Last Activity</span>
                            <span className="text-sm">
                              {new Date(site.lastActivity).toLocaleString()}
                            </span>
                          </div>
                          {site.issues.length > 0 && (
                            <div className="mt-2">
                              <Badge className="bg-red-100 text-red-800">
                                {site.issues.length} issue{site.issues.length !== 1 ? 's' : ''}
                              </Badge>
                            </div>
                          )}
                          <div className="flex space-x-2 mt-4">
                            <Button variant="outline" size="sm">
                              <Eye className="h-3 w-3 mr-1" />
                              Details
                            </Button>
                            <Button variant="outline" size="sm">
                              <MessageSquare className="h-3 w-3 mr-1" />
                              Contact
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Performance Reports
                </CardTitle>
                <CardDescription>Generate and view detailed performance reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <Calendar className="h-8 w-8 text-blue-500 mb-4" />
                      <h3 className="font-semibold">Daily Report</h3>
                      <p className="text-sm text-gray-600 mb-4">Today's attendance and patrol summary</p>
                      <Button variant="outline" className="w-full">
                        Generate
                      </Button>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <BarChart3 className="h-8 w-8 text-green-500 mb-4" />
                      <h3 className="font-semibold">Weekly Report</h3>
                      <p className="text-sm text-gray-600 mb-4">7-day performance analysis</p>
                      <Button variant="outline" className="w-full">
                        Generate
                      </Button>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <TrendingUp className="h-8 w-8 text-purple-500 mb-4" />
                      <h3 className="font-semibold">Monthly Report</h3>
                      <p className="text-sm text-gray-600 mb-4">Comprehensive monthly metrics</p>
                      <Button variant="outline" className="w-full">
                        Generate
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}