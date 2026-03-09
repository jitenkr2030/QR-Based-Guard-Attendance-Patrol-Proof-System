'use client'

import { useState, useEffect } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Shield, 
  QrCode, 
  Users, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  BarChart3,
  Calendar,
  FileText,
  Settings,
  LogOut,
  User,
  RefreshCw,
  Activity
} from 'lucide-react'
import { useDashboardData } from '@/hooks/use-dashboard-data'
import AttendanceTable from '@/components/attendance-table'
import GuardManagement from '@/components/guard-management'
import ReportGeneration from '@/components/report-generation'
import PASARACompliance from '@/components/pasara-compliance'

export default function HomePage() {
  const { data: session, status } = useSession()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0)
    return () => clearTimeout(timer)
  }, [])

  if (!mounted) {
    return null
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session) {
    return <LandingPage />
  }

  return <Dashboard session={session} />
}

function LandingPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      await signIn('credentials', {
        email,
        password,
        redirect: false
      })
      window.location.reload()
    } catch (error) {
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-primary mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">QR Guard System</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Digital workforce monitoring platform for security companies to track guard attendance and verify patrol activities using QR code scanning
          </p>
        </header>

        <div className="max-w-md mx-auto mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
              <CardDescription>Access your guard management dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card>
            <CardHeader>
              <QrCode className="h-8 w-8 text-primary mb-2" />
              <CardTitle>QR-Based Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Guards simply scan QR codes to mark check-in and check-out times with automatic timestamp recording.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <MapPin className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Patrol Verification</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Multiple QR codes across patrol points ensure guards complete their rounds as required.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Real-time Monitoring</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Supervisors can monitor guard activity, attendance, and patrol completion in real-time.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Key Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Badge variant="secondary" className="p-3 text-sm">
              <CheckCircle className="h-4 w-4 mr-2" />
              Automated Reports
            </Badge>
            <Badge variant="secondary" className="p-3 text-sm">
              <Users className="h-4 w-4 mr-2" />
              Multi-Site Management
            </Badge>
            <Badge variant="secondary" className="p-3 text-sm">
              <FileText className="h-4 w-4 mr-2" />
              Client Transparency
            </Badge>
            <Badge variant="secondary" className="p-3 text-sm">
              <Settings className="h-4 w-4 mr-2" />
              Role-Based Access
            </Badge>
          </div>
        </div>
      </div>
    </div>
  )
}

function Dashboard({ session }: { session: any }) {
  const { stats, recentActivity, loading, error, refetch } = useDashboardData()
  const userRole = session.user.role
  const userName = session.user.name

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800'
      case 'SUPERVISOR': return 'bg-blue-100 text-blue-800'
      case 'GUARD': return 'bg-green-100 text-green-800'
      case 'CLIENT': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getActivityIcon = (icon: string, color: string) => {
    const iconClass = `h-4 w-4 text-${color}-500`
    switch (icon) {
      case 'check-circle': return <CheckCircle className={iconClass} />
      case 'map-pin': return <MapPin className={iconClass} />
      case 'calendar': return <Calendar className={iconClass} />
      default: return <Activity className={iconClass} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-primary mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">QR Guard System</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={refetch} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span className="font-medium">{userName}</span>
                <Badge className={getRoleColor(userRole)}>
                  {userRole.toLowerCase()}
                </Badge>
              </div>
              <Button variant="outline" onClick={() => signOut()}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {userName}!</h2>
          <p className="text-gray-600">Here's what's happening with your security operations today.</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="patrols">Patrols</TabsTrigger>
            <TabsTrigger value="guards">Guards</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="pasara">PASARA</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Guards</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loading ? '...' : stats?.totalGuards || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {userRole === 'GUARD' ? 'Your profile' : 'Active guards'}
                  </p>
                </CardContent>
              </Card>

              {userRole !== 'GUARD' && userRole !== 'CLIENT' && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Sites</CardTitle>
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{loading ? '...' : stats?.activeSites || 0}</div>
                    <p className="text-xs text-muted-foreground">All operational</p>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Attendance</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loading ? '...' : stats?.todayAttendance || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.lateCheckins && stats.lateCheckins > 0 ? 
                      `${stats.lateCheckins} late` : 'On time'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Patrol Completion</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loading ? '...' : `${stats?.patrolCompletion || 0}%`}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.missedPatrols && stats.missedPatrols > 0 ? 
                      `${stats.missedPatrols} missed` : 'On track'}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <RefreshCw className="h-6 w-6 animate-spin" />
                      </div>
                    ) : recentActivity && recentActivity.length > 0 ? (
                      recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-center space-x-3">
                          {getActivityIcon(activity.icon, activity.color)}
                          <div className="flex-1">
                            <p className="text-sm font-medium">{activity.title}</p>
                            <p className="text-xs text-gray-500">{activity.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-medium">
                              {new Date(activity.timestamp).toLocaleTimeString()}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(activity.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-8">No recent activity</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Button className="h-20 flex-col" variant="outline">
                      <QrCode className="h-6 w-6 mb-2" />
                      Scan QR Code
                    </Button>
                    <Button className="h-20 flex-col" variant="outline">
                      <Users className="h-6 w-6 mb-2" />
                      Manage Guards
                    </Button>
                    <Button className="h-20 flex-col" variant="outline">
                      <MapPin className="h-6 w-6 mb-2" />
                      View Sites
                    </Button>
                    <Button className="h-20 flex-col" variant="outline">
                      <FileText className="h-6 w-6 mb-2" />
                      Generate Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="attendance">
            <AttendanceTable />
          </TabsContent>

          <TabsContent value="patrols">
            <Card>
              <CardHeader>
                <CardTitle>Patrol Monitoring</CardTitle>
                <CardDescription>Track patrol completion and activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-blue-600">{loading ? '...' : stats?.patrolCompletion || 0}%</div>
                        <p className="text-sm text-gray-600">Completion Rate</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-orange-600">{loading ? '...' : stats?.missedPatrols || 0}</div>
                        <p className="text-sm text-gray-600">Missed Patrols</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-green-600">Live</div>
                        <p className="text-sm text-gray-600">Real-time Tracking</p>
                      </CardContent>
                    </Card>
                  </div>
                  <p className="text-gray-600">Real-time patrol monitoring and missed patrol detection.</p>
                  <Button>View Patrol Details</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="guards">
            <GuardManagement />
          </TabsContent>

          <TabsContent value="pasara">
            <PASARACompliance />
          </TabsContent>

        <TabsContent value="reports">
            <ReportGeneration />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}