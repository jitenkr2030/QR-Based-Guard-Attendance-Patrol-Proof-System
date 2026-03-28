'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Users, 
  Building, 
  MapPin, 
  Activity, 
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Eye,
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
  totalPatrols: number
  missedPatrols: number
  lastActivity: string
  status: 'active' | 'inactive'
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

  // Fetch supervisor-specific data
  const fetchSupervisorData = async () => {
    try {
      // Simulate fetching guard performance data
      const mockGuardPerformance: GuardPerformance[] = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          employeeId: 'GUARD001',
          attendanceRate: 95.2,
          punctualityRate: 88.5,
          totalShifts: 30,
          presentDays: 28,
          totalPatrols: 120,
          missedPatrols: 5,
          lastActivity: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          status: 'active'
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          employeeId: 'GUARD002',
          attendanceRate: 92.8,
          punctualityRate: 95.2,
          totalShifts: 30,
          presentDays: 27,
          totalPatrols: 118,
          missedPatrols: 3,
          lastActivity: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          status: 'active'
        },
        {
          id: '3',
          name: 'Mike Johnson',
          email: 'mike@example.com',
          employeeId: 'GUARD003',
          attendanceRate: 88.1,
          punctualityRate: 82.3,
          totalShifts: 30,
          presentDays: 26,
          totalPatrols: 115,
          missedPatrols: 8,
          lastActivity: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          status: 'active'
        }
      ]
      setGuardPerformance(mockGuardPerformance)

      // Simulate fetching site metrics
      const mockSiteMetrics: SiteMetrics[] = [
        {
          id: '1',
          name: 'Main Office',
          address: '123 Business Ave, Downtown',
          totalGuards: 8,
          presentGuards: 7,
          attendanceRate: 87.5,
          patrolCompletion: 92,
          lastActivity: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          issues: ['Late check-in: 1 guard']
        },
        {
          id: '2',
          name: 'Warehouse',
          address: '456 Industrial Park',
          totalGuards: 6,
          presentGuards: 5,
          attendanceRate: 83.3,
          patrolCompletion: 88,
          lastActivity: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
          issues: ['Missed patrol: 2 points']
        }
      ]
      setSiteMetrics(mockSiteMetrics)
    } catch (error) {
      console.error('Error fetching supervisor data:', error)
    }
  }

  useEffect(() => {
    if (session?.user?.role === 'SUPERVISOR') {
      fetchSupervisorData()
    }
  }, [session])

  const getPerformanceColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600'
    if (rate >= 80) return 'text-blue-600'
    if (rate >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getPerformanceBadge = (rate: number) => {
    if (rate >= 95) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>
    if (rate >= 85) return <Badge className="bg-blue-100 text-blue-800">Good</Badge>
    if (rate >= 75) return <Badge className="bg-yellow-100 text-yellow-800">Fair</Badge>
    return <Badge className="bg-red-100 text-red-800">Poor</Badge>
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
      default:
        return <Badge className="bg-red-100 text-red-800">Unknown</Badge>
    }
  }

  if (session?.user?.role !== 'SUPERVISOR') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Supervisor Portal</h2>
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
                <p className="text-sm text-gray-500">Monitor and manage your assigned sites</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={refetch} disabled={loading}>
                <Activity className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {/* Dashboard Stats */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Operations Overview</h2>
          <p className="text-gray-600">Real-time monitoring of your security operations</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="guards">Guards</TabsTrigger>
            <TabsTrigger value="sites">Sites</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Guards</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{guardPerformance.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {guardPerformance.filter(g => g.status === 'active').length} active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Managed Sites</CardTitle>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{siteMetrics.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {siteMetrics.filter(s => s.issues.length === 0).length} normal
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(guardPerformance.reduce((sum, g) => sum + g.attendanceRate, 0) / guardPerformance.length).toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Last 30 days
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Issues</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {siteMetrics.reduce((sum, s) => sum + s.issues.length, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Requiring attention
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest security activities at your locations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity?.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          {activity.type === 'attendance' ? (
                            <CheckCircle className="h-4 w-4 text-blue-600" />
                          ) : (
                            <MapPin className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{activity.title}</p>
                          <p className="text-sm text-gray-500">{activity.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {new Date(activity.timestamp).toLocaleTimeString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="guards">
            <Card>
              <CardHeader>
                <CardTitle>Guard Performance</CardTitle>
                <CardDescription>Monitor and manage your security guards</CardDescription>
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
                        <TableHead>Last Activity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {guardPerformance.map((guard) => (
                        <TableRow key={guard.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
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
                              <span className={`font-medium ${getPerformanceColor(guard.attendanceRate)}`}>
                                {guard.attendanceRate}%
                              </span>
                              {getPerformanceBadge(guard.attendanceRate)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <span className={`font-medium ${getPerformanceColor(guard.punctualityRate)}`}>
                                {guard.punctualityRate}%
                              </span>
                              {getPerformanceBadge(guard.punctualityRate)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{guard.presentDays}/{guard.totalShifts}</div>
                              <div className="text-gray-500">shifts</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{guard.totalPatrols - guard.missedPatrols}/{guard.totalPatrols}</div>
                              <div className="text-gray-500">completed</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(guard.status)}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {new Date(guard.lastActivity).toLocaleString()}
                            </div>
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
            <div className="space-y-6">
              {siteMetrics.map((site, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center">
                          <Building className="h-5 w-5 mr-2" />
                          {site.name}
                        </CardTitle>
                        <CardDescription>{site.address}</CardDescription>
                      </div>
                      <div className="text-right">
                        {site.issues.length > 0 ? (
                          <Badge className="bg-red-100 text-red-800">
                            {site.issues.length} issue{site.issues.length !== 1 ? 's' : ''}
                          </Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-800">
                            Normal
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{site.presentGuards}/{site.totalGuards}</div>
                        <p className="text-sm text-gray-600">Guards Present</p>
                        <Progress value={(site.presentGuards / site.totalGuards) * 100} className="mt-2" />
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{site.attendanceRate}%</div>
                        <p className="text-sm text-gray-600">Attendance Rate</p>
                        <Progress value={site.attendanceRate} className="mt-2" />
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{site.patrolCompletion}%</div>
                        <p className="text-sm text-gray-600">Patrol Completion</p>
                        <Progress value={site.patrolCompletion} className="mt-2" />
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {new Date(site.lastActivity).toLocaleTimeString()}
                        </div>
                        <p className="text-sm text-gray-600">Last Activity</p>
                      </div>
                    </div>

                    {site.issues.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Issues</h4>
                        <div className="space-y-2">
                          {site.issues.map((issue, issueIndex) => (
                            <div key={issueIndex} className="flex items-center space-x-2 p-2 bg-red-50 rounded">
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                              <span className="text-sm text-red-800">{issue}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="alerts">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Active Alerts
                  </CardTitle>
                  <CardDescription>Issues requiring your attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {siteMetrics.filter(s => s.issues.length > 0).map((site, index) => (
                      <Card key={index} className="border-l-4 border-l-red-500">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{site.name}</h4>
                            <Badge className="bg-red-100 text-red-800">
                              {site.issues.length} issue{site.issues.length !== 1 ? 's' : ''}
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            {site.issues.map((issue, issueIndex) => (
                              <div key={issueIndex} className="flex items-center space-x-2 text-sm">
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                                <span>{issue}</span>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3">
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3 mr-1" />
                              View Details
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {siteMetrics.filter(s => s.issues.length === 0).length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">All Systems Normal</h3>
                        <p className="text-gray-600">No active alerts at this time</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}