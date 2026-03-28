'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Calendar, Search, Filter, Download, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react'

interface AttendanceRecord {
  id: string
  guard: {
    user: {
      name: string
      email: string
    }
    employeeId: string
  }
  site: {
    name: string
    address: string
  }
  type: 'CHECK_IN' | 'CHECK_OUT'
  timestamp: string
  location: string
  isVerified: boolean
}

interface Site {
  id: string
  name: string
  address: string
}

interface Guard {
  id: string
  user: {
    name: string
    email: string
  }
  employeeId: string
}

export default function AttendanceTable() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [sites, setSites] = useState<Site[]>([])
  const [guards, setGuards] = useState<Guard[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSite, setSelectedSite] = useState('')
  const [selectedGuard, setSelectedGuard] = useState('')
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  })

  const fetchAttendanceData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const today = new Date()
      const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      
      const response = await fetch(`/api/attendance?startDate=${lastWeek.toISOString()}&endDate=${today.toISOString()}`)
      if (!response.ok) throw new Error('Failed to fetch attendance')
      
      const data = await response.json()
      setAttendance(data)
    } catch (error) {
      console.error('Error fetching attendance:', error)
      setError('Failed to load attendance data')
    } finally {
      setLoading(false)
    }
  }

  const fetchSitesAndGuards = async () => {
    try {
      const [sitesResponse, guardsResponse] = await Promise.all([
        fetch('/api/sites'),
        fetch('/api/guards')
      ])
      
      if (sitesResponse.ok) {
        const sitesData = await sitesResponse.json()
        setSites(sitesData)
      }
      
      if (guardsResponse.ok) {
        const guardsData = await guardsResponse.json()
        setGuards(guardsData)
      }
    } catch (error) {
      console.error('Error fetching sites and guards:', error)
    }
  }

  const handleFilter = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (dateRange.start) params.append('startDate', dateRange.start)
      if (dateRange.end) params.append('endDate', dateRange.end)
      if (selectedSite) params.append('siteId', selectedSite)
      if (selectedGuard) params.append('guardId', selectedGuard)
      if (searchTerm) params.append('search', searchTerm)
      
      const response = await fetch(`/api/attendance?${params}`)
      if (!response.ok) throw new Error('Failed to filter attendance')
      
      const data = await response.json()
      setAttendance(data)
    } catch (error) {
      console.error('Error filtering attendance:', error)
      setError('Failed to filter attendance')
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    const headers = ['Date', 'Guard Name', 'Employee ID', 'Site', 'Type', 'Location', 'Verified']
    const csvData = attendance.map(record => [
      new Date(record.timestamp).toLocaleDateString(),
      record.guard.user.name,
      record.guard.employeeId,
      record.site.name,
      record.type,
      record.location,
      record.isVerified ? 'Yes' : 'No'
    ])
    
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `attendance-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getStatusBadge = (type: string, isVerified: boolean) => {
    if (type === 'CHECK_IN') {
      return <Badge className="bg-green-100 text-green-800">Check In</Badge>
    } else {
      return isVerified 
        ? <Badge className="bg-blue-100 text-blue-800">Check Out</Badge>
        : <Badge className="bg-red-100 text-red-800">Unverified</Badge>
      }
    }
  }

  useEffect(() => {
    fetchAttendanceData()
    fetchSitesAndGuards()
  }, [])

  useEffect(() => {
    if (dateRange.start || dateRange.end || selectedSite || selectedGuard || searchTerm) {
      handleFilter()
    }
  }, [dateRange.start, dateRange.end, selectedSite, selectedGuard, searchTerm])

  const filteredAttendance = attendance.filter(record => {
    const matchesSearch = 
      record.guard.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.guard.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.site.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesSite = !selectedSite || record.site.id === selectedSite
    const matchesGuard = !selectedGuard || record.guard.id === selectedGuard
    const matchesDateRange = 
      (!dateRange.start || new Date(record.timestamp) >= new Date(dateRange.start)) &&
      (!dateRange.end || new Date(record.timestamp) <= new Date(dateRange.end))
    
    return matchesSearch && matchesSite && matchesGuard && matchesDateRange
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Attendance Records
              </CardTitle>
              <CardDescription>
                Track and manage guard attendance across all sites
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" onClick={fetchAttendanceData} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="site">Site</Label>
              <Select value={selectedSite} onValueChange={setSelectedSite}>
                <SelectTrigger>
                  <SelectValue placeholder="All sites" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All sites</SelectItem>
                  {sites.map((site) => (
                    <SelectItem key={site.id} value={site.id}>
                      {site.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="guard">Guard</Label>
              <Select value={selectedGuard} onValueChange={setSelectedGuard}>
                <SelectTrigger>
                  <SelectValue placeholder="All guards" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All guards</SelectItem>
                  {guards.map((guard) => (
                    <SelectItem key={guard.id} value={guard.id}>
                      {guard.user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by name, employee ID, or site..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
          <CardDescription>
            {filteredAttendance.length} record{filteredAttendance.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          ) : filteredAttendance.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No attendance records found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Guard</TableHead>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Site</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAttendance.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            {new Date(record.timestamp).toLocaleDateString()}
                          </div>
                          <div className="text-gray-500">
                            {new Date(record.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium">
                              {record.guard.user.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">{record.guard.user.name}</div>
                            <div className="text-sm text-gray-500">{record.guard.employeeId}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{record.guard.employeeId}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{record.site.name}</div>
                          <div className="text-gray-500">{record.site.address}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(record.type, record.isVerified)}
                      </TableCell>
                      <TableCell>{record.location}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {record.isVerified ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="text-sm">
                            {record.isVerified ? 'Verified' : 'Unverified'}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}