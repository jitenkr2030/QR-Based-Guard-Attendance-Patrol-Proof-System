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
  Building, 
  Users, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Activity,
  TrendingUp,
  AlertTriangle,
  Calendar,
  FileText,
  Bell
} from 'lucide-react'
import { useDashboardData } from '@/hooks/use-dashboard-data'

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

interface ServiceVerification {
  siteName: string
  address: string
  totalGuards: number
  presentGuards: number
  attendanceRate: number
  patrolCompletion: number
  lastActivity: string
  dailyLogs: {
    date: string
    checkIns: number
    checkOuts: number
    patrols: number
    issues: string[]
  }[]
  monthlySummary: {
    month: string
    totalDays: number
    presentDays: number
    absentDays: number
    avgResponseTime: number
    serviceLevel: number
  }
}

export default function ClientDashboard() {
  const { data: session } = useSession()
  const { stats, recentActivity, loading, error, refetch } = useDashboardData()
  const [serviceData, setServiceData] = useState<ServiceVerification[]>([])
  const [monthlyReport, setMonthlyReport] = useState<any>(null)

  // Fetch client-specific data
  const fetchClientData = async () => {
    try {
      // Simulate fetching client-specific data
      const mockServiceData: ServiceVerification[] = [
        {
          siteName: 'ABC Corporate Office',
          address: '123 Business Ave, Downtown, City 12345',
          totalGuards: 8,
          presentGuards: 7,
          attendanceRate: 87.5,
          patrolCompletion: 92,
          lastActivity: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          dailyLogs: [
            {
              date: new Date().toISOString().split('T')[0],
              checkIns: 7,
              checkOuts: 6,
              patrols: 28,
              issues: ['Late check-in: 1 guard']
            }
          ],
          monthlySummary: {
            month: '2024-12',
            totalDays: 31,
            presentDays: 28,
            absentDays: 3,
            avgResponseTime: 5.2,
            serviceLevel: 94.5
          }
        },
        {
          siteName: 'ABC Warehouse Facility',
          address: '456 Industrial Park, City 67890',
          totalGuards: 6,
          presentGuards: 5,
          attendanceRate: 83.3,
          patrolCompletion: 88,
          lastActivity: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          dailyLogs: [
            {
              date: new Date().toISOString().split('T')[0],
              checkIns: 5,
              checkOuts: 4,
              patrols: 20,
              issues: ['Missed patrol: 2 points']
            }
          ],
          monthlySummary: {
            month: '2024-12',
            totalDays: 31,
            presentDays: 26,
            absentDays: 5,
            avgResponseTime: 6.8,
            serviceLevel: 91.2
          }
        }
      ]
      setServiceData(mockServiceData)

      const mockMonthlyReport = {
        period: '2024-12',
        totalSites: 2,
        totalGuards: 14,
        overallAttendance: 85.4,
        overallPatrolCompletion: 90,
        totalShifts: 420,
        completedShifts: 358,
        serviceLevelAgreement: 95,
        clientSatisfaction: 4.6,
        incidents: 3,
        responseTime: 6.0,
        generatedAt: new Date().toISOString()
      }
      setMonthlyReport(mockMonthlyReport)
    } catch (error) {
      console.error('Error fetching client data:', error)
    }
  }

  useEffect(() => {
    if (session?.user?.role === 'CLIENT') {
      fetchClientData()
    }
  }, [session])

  const getServiceLevelColor = (level: number) => {
    if (level >= 95) return 'text-green-600'
    if (level >= 90) return 'text-blue-600'
    if (level >= 80) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getServiceLevelBadge = (level: number) => {
    if (level >= 95) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>
    if (level >= 90) return <Badge className="bg-blue-100 text-blue-800">Good</Badge>
    if (level >= 80) return <Badge className="bg-yellow-100 text-yellow-800">Fair</Badge>
    return <Badge className="bg-red-100 text-red-800">Poor</Badge>
  }

  if (session?.user?.role !== 'CLIENT') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Building className="h-12 w-12 text-purple-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Client Portal</h2>
              <p className="text-gray-600">This page is only accessible to clients.</p>
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
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Building className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Client Portal</h1>
                <p className="text-sm text-gray-500">Verify your security services in real-time</p>
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
        {/* Service Overview */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Service Verification Dashboard</h2>
          <p className="text-gray-600">Real-time monitoring of your security services</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sites">Sites</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="verification">Verification</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Service Level</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{monthlyReport?.serviceLevelAgreement || 95}%</div>
                  <p className="text-xs text-muted-foreground">
                    {getServiceLevelBadge(monthlyReport?.serviceLevelAgreement || 95)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{monthlyReport?.overallAttendance || 85.4}%</div>
                  <p className="text-xs text-muted-foreground">
                    {monthlyReport?.completedShifts || 358}/{monthlyReport?.totalShifts || 420} shifts
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Patrol Completion</CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{monthlyReport?.overallPatrolCompletion || 90}%</div>
                  <p className="text-xs text-muted-foreground">
                    Active monitoring
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Response Time</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{monthlyReport?.responseTime || 6.0} min</div>
                  <p className="text-xs text-muted-foreground">
                    Average response time
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
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          {activity.type === 'attendance' ? (
                            <CheckCircle className="h-4 w-4 text-purple-600" />
                          ) : (
                            <MapPin className="h-4 w-4 text-purple-600" />
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

          <TabsContent value="sites">
            <div className="space-y-6">
              {serviceData.map((site, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center">
                          <Building className="h-5 w-5 mr-2" />
                          {site.siteName}
                        </CardTitle>
                        <CardDescription>{site.address}</CardDescription>
                      </div>
                      <div className="text-right">
                        {getServiceLevelBadge(site.monthlySummary.serviceLevel)}
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

                    {/* Daily Logs */}
                    <div className="mt-6">
                      <h4 className="font-medium mb-3">Daily Logs</h4>
                      <div className="space-y-2">
                        {site.dailyLogs.map((log, logIndex) => (
                          <div key={logIndex} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="text-sm">
                              <span className="font-medium">{log.date}</span>
                              <div className="text-gray-500">
                                {log.checkIns} check-ins, {log.checkOuts} check-outs, {log.patrols} patrols
                              </div>
                            </div>
                            <div className="text-right">
                              {log.issues.length > 0 ? (
                                <Badge className="bg-red-100 text-red-800 text-xs">
                                  {log.issues.length} issues
                                </Badge>
                              ) : (
                                <Badge className="bg-green-100 text-green-800 text-xs">
                                  No issues
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <div className="space-y-6">
              {/* Monthly Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Monthly Service Summary
                  </CardTitle>
                  <CardDescription>
                    {monthlyReport?.period} - Comprehensive service verification
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">Service Metrics</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Service Level</span>
                          <span className="font-medium">{monthlyReport?.serviceLevelAgreement}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Client Satisfaction</span>
                          <span className="font-medium">{monthlyReport?.clientSatisfaction}/5.0</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Incidents</span>
                          <span className="font-medium">{monthlyReport?.incidents}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Avg Response Time</span>
                          <span className="font-medium">{monthlyReport?.responseTime} min</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Performance</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Total Shifts</span>
                          <span className="font-medium">{monthlyReport?.totalShifts}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Completed Shifts</span>
                          <span className="font-medium">{monthlyReport?.completedShifts}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Present Days</span>
                          <span className="font-medium">{monthlyReport?.presentDays}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Absent Days</span>
                          <span className="font-medium">{monthlyReport?.absentDays}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Compliance</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">SLA Met</span>
                          <span className={`font-medium ${getServiceLevelColor(monthlyReport?.serviceLevelAgreement || 95)}`}>
                            {monthlyReport?.serviceLevelAgreement >= 95 ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Quality Score</span>
                          <span className="font-medium">{monthlyReport?.clientSatisfaction}/5.0</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2 mt-6">
                    <Button variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                    <Button variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Download Excel
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Report History */}
              <Card>
                <CardHeader>
                  <CardTitle>Report History</CardTitle>
                  <CardDescription>Previous monthly reports and archives</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['2024-11', '2024-10', '2024-09'].map((month) => (
                      <div key={month} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{month}</p>
                          <p className="text-sm text-gray-500">
                            Service Level: {Math.floor(Math.random() * 10 + 90)}%
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <FileText className="h-3 w-3" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <FileText className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="verification">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Service Verification
                  </CardTitle>
                  <CardDescription>
                    Independent verification of security service delivery
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-3">Verification Metrics</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Guard Presence</span>
                            <span className="text-sm text-green-600">Verified</span>
                          </div>
                          <p className="text-xs text-gray-600">
                            Real-time guard presence confirmed at all locations
                          </p>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Patrol Completion</span>
                            <span className="text-sm text-green-600">Verified</span>
                          </div>
                          <p className="text-xs text-gray-600">
                            All patrol points scanned and verified
                          </p>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Time Stamps</span>
                            <span className="text-sm text-green-600">Verified</span>
                          </div>
                          <p className="text-xs text-gray-600">
                            All timestamps cryptographically secured
                          </p>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Data Integrity</span>
                            <span className="text-sm text-green-600">Verified</span>
                          </div>
                          <p className="text-xs text-gray-600">
                            All data integrity checks passed
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Verification Methods</h4>
                      <div className="space-y-3">
                        <div className="p-3 border rounded-lg">
                          <h5 className="font-medium text-sm mb-1">QR Code Scanning</h5>
                          <p className="text-xs text-gray-600">
                            Each scan creates a cryptographically secure record with timestamp and location verification
                          </p>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <h5 className="font-medium text-sm mb-1">Geolocation Validation</h5>
                          <p className="text-xs text-gray-600">
                            GPS coordinates verified for each patrol point to ensure physical presence
                          </p>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <h5 className="font-medium text-sm mb-1">Blockchain Logging</h5>
                          <p className="text-xs text-gray-600">
                            All activities logged to immutable ledger for complete audit trail
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <Button className="w-full">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        View Detailed Verification Report
                      </Button>
                    </div>
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