'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Calendar, 
  Plus, 
  Search, 
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Send,
  Eye,
  MessageSquare
} from 'lucide-react'
import { useSession } from 'next-auth/react'

interface LeaveRequest {
  id: string
  startDate: string
  endDate: string
  reason: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
  approvedAt?: string
  approvedBy?: string
  rejectReason?: string
  guard: {
    user: {
      name: string
      email: string
    }
  }
}

export default function LeaveRequestManagement() {
  const { data: session } = useSession()
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    reason: ''
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchLeaveRequests()
  }, [])

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/leave-requests')
      if (!response.ok) throw new Error('Failed to fetch leave requests')
      
      const data = await response.json()
      setLeaveRequests(data)
    } catch (error) {
      console.error('Error fetching leave requests:', error)
      setError('Failed to load leave requests')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/leave-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit leave request')
      }

      const newRequest = await response.json()
      setLeaveRequests(prev => [newRequest, ...prev])
      setIsAddDialogOpen(false)
      setFormData({ startDate: '', endDate: '', reason: '' })
    } catch (error: any) {
      console.error('Error submitting leave request:', error)
      setError(error.message || 'Failed to submit leave request')
    } finally {
      setSubmitting(false)
    }
  }

  const handleApproveReject = async (requestId: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      const response = await fetch(`/api/leave-requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: action === 'approve' ? 'APPROVED' : 'REJECTED',
          rejectReason: action === 'reject' ? reason : undefined
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to ${action} leave request`)
      }

      const updatedRequest = await response.json()
      setLeaveRequests(prev => 
        prev.map(req => req.id === requestId ? updatedRequest : req)
      )
    } catch (error) {
      console.error(`Error ${action}ing leave request:`, error)
      setError(`Failed to ${action} leave request`)
    }
  }

  const filteredRequests = leaveRequests.filter(request => {
    const matchesSearch = 
      request.guard.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.reason.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = !statusFilter || request.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'APPROVED':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'REJECTED':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />
    }
  }

  const canApproveReject = session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPERVISOR'

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Leave Requests</CardTitle>
              <CardDescription>
                Manage and review guard leave requests
              </CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Submit Request
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Submit Leave Request</DialogTitle>
                  <DialogDescription>
                    Request time off from your security duties
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmitRequest} className="space-y-6">
                  {error && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start-date">Start Date *</Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="end-date">End Date *</Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                        min={formData.startDate}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="reason">Reason *</Label>
                    <Textarea
                      id="reason"
                      value={formData.reason}
                      onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                      placeholder="Please provide a reason for your leave request..."
                      rows={4}
                      required
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setIsAddDialogOpen(false)
                        setError(null)
                        setFormData({ startDate: '', endDate: '', reason: '' })
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Submit Request
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search leave requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leave Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Leave Requests</CardTitle>
          <CardDescription>
            {filteredRequests.length} request{filteredRequests.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No leave requests found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Guard</TableHead>
                    <TableHead>Leave Period</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Processed</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium">
                              {request.guard.user.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">{request.guard.user.name}</div>
                            <div className="text-sm text-gray-500">{request.guard.user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{new Date(request.startDate).toLocaleDateString()}</div>
                          <div className="text-gray-500">to {new Date(request.endDate).toLocaleDateString()}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="text-sm truncate">{request.reason}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(request.status)}
                          {getStatusBadge(request.status)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {request.approvedAt ? (
                            <>
                              <div>{new Date(request.approvedAt).toLocaleDateString()}</div>
                              <div className="text-gray-500">by {request.approvedBy}</div>
                            </>
                          ) : (
                            <span className="text-gray-500">Not processed</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {request.status === 'PENDING' && canApproveReject && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleApproveReject(request.id, 'approve')}
                              >
                                <CheckCircle className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const reason = prompt('Enter rejection reason:')
                                  if (reason) {
                                    handleApproveReject(request.id, 'reject', reason)
                                  }
                                }}
                              >
                                <XCircle className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                          <Button variant="outline" size="sm">
                            <Eye className="h-3 w-3" />
                          </Button>
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