'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Calendar, Search, Download, Filter, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { useAttendance } from '@/hooks/use-dashboard-data'
import { format } from 'date-fns'

interface AttendanceRecord {
  id: string
  guardName: string
  guardId: string
  siteName: string
  type: 'CHECK_IN' | 'CHECK_OUT'
  timestamp: string
  location: string
  status?: 'on-time' | 'late'
}

export default function AttendanceTable() {
  const { attendance, loading, error, fetchAttendance } = useAttendance()
  const [filteredAttendance, setFilteredAttendance] = useState<AttendanceRecord[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSite, setSelectedSite] = useState('')
  const [selectedGuard, setSelectedGuard] = useState('')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [sites, setSites] = useState<any[]>([])
  const [guards, setGuards] = useState<any[]>([])

  useEffect(() => {
    // Fetch initial data
    fetchAttendanceData()
    
    // Fetch sites and guards for filters
    fetchSitesAndGuards()
  }, [])

  useEffect(() => {
    // Filter attendance based on search and filters
    let filtered = attendance
    
    if (searchTerm) {
      filtered = filtered.filter(record => 
        record.guardName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.siteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (selectedSite) {
      filtered = filtered.filter(record => record.siteName === selectedSite)
    }
    
    if (selectedGuard) {
      filtered = filtered.filter(record => record.guardName === selectedGuard)
    }
    
    setFilteredAttendance(filtered)
  }, [attendance, searchTerm, selectedSite, selectedGuard])

  const fetchAttendanceData = async () => {
    const today = new Date()
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    await fetchAttendance(
      undefined, // siteId
      undefined, // guardId
      lastWeek.toISOString().split('T')[0],
      today.toISOString().split('T')[0]
    )
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
    await fetchAttendance(
      selectedSite || undefined,
      selectedGuard || undefined,
      dateRange.start,
      dateRange.end
    )
  }

  const exportToCSV = () => {
    const headers = ['Date', 'Guard Name', 'Site', 'Type', 'Location', 'Time', 'Status']
    const csvData = filteredAttendance.map(record => [
      new Date(record.timestamp).toLocaleDateString(),
      record.guardName,
      record.siteName,
      record.type,
      record.location,
      new Date(record.timestamp).toLocaleTimeString(),
      record.status || 'N/A'
    ])
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `attendance_report_${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getStatusBadge = (record: AttendanceRecord) => {
    if (record.type === 'CHECK_OUT') return null
    
    const hour = new Date(record.timestamp).getHours()
    const isLate = hour > 9 || (hour === 9 && new Date(record.timestamp).getMinutes() > 0)
    
    if (isLate) {
      return <Badge className="bg-yellow-100 text-yellow-800">Late</Badge>
    }
    return <Badge className="bg-green-100 text-green-800">On Time</Badge>
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'CHECK_IN':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'CHECK_OUT':
        return <XCircle className="h-4 w-4 text-blue-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />
    }
  }

  if (loading && attendance.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search guards, sites..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
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
                    <SelectItem key={site.id} value={site.name}>
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
                    <SelectItem key={guard.id} value={guard.name}>
                      {guard.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
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
          
          <div className="flex justify-end mt-4 space-x-2">
            <Button variant="outline" onClick={handleFilter}>
              Apply Filters
            </Button>
            <Button onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Attendance Records</CardTitle>
              <CardDescription>
                Showing {filteredAttendance.length} of {attendance.length} records
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchAttendanceData}>
              <Calendar className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8 text-red-600">
              Error loading attendance data: {error}
            </div>
          ) : filteredAttendance.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No attendance records found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Guard</TableHead>
                    <TableHead>Site</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAttendance.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        {format(new Date(record.timestamp), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell className="font-medium">
                        {record.guardName}
                      </TableCell>
                      <TableCell>{record.siteName}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(record.type)}
                          <span>{record.type === 'CHECK_IN' ? 'Check In' : 'Check Out'}</span>
                        </div>
                      </TableCell>
                      <TableCell>{record.location}</TableCell>
                      <TableCell>
                        {format(new Date(record.timestamp), 'HH:mm:ss')}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(record)}
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