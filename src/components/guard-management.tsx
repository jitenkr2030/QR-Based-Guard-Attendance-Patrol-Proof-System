'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  UserPlus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Phone,
  Mail,
  Building,
  Calendar,
  DollarSign
} from 'lucide-react'
import { useGuards, useSites } from '@/hooks/use-dashboard-data'

interface GuardFormData {
  name: string
  email: string
  password: string
  phone: string
  employeeId: string
  department: string
  hireDate: string
  salary: string
  siteIds: string[]
}

export default function GuardManagement() {
  const { guards, loading, error, fetchGuards, createGuard } = useGuards()
  const { sites } = useSites()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingGuard, setEditingGuard] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSite, setSelectedSite] = useState('')
  const [formData, setFormData] = useState<GuardFormData>({
    name: '',
    email: '',
    password: '',
    phone: '',
    employeeId: '',
    department: '',
    hireDate: '',
    salary: '',
    siteIds: []
  })

  const filteredGuards = guards.filter(guard => 
    guard.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guard.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guard.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(guard => 
    !selectedSite || guard.assignments.some((assignment: any) => assignment.site.name === selectedSite)
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await createGuard(formData)
      setIsAddDialogOpen(false)
      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        employeeId: '',
        department: '',
        hireDate: '',
        salary: '',
        siteIds: []
      })
    } catch (error) {
      console.error('Error creating guard:', error)
    }
  }

  const handleInputChange = (field: keyof GuardFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSiteSelection = (siteId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      siteIds: checked 
        ? [...prev.siteIds, siteId]
        : prev.siteIds.filter(id => id !== siteId)
    }))
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive 
      ? <Badge className="bg-green-100 text-green-800">Active</Badge>
      : <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Guard Management</CardTitle>
              <CardDescription>
                Manage security guards and their assignments
              </CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Guard
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Guard</DialogTitle>
                  <DialogDescription>
                    Create a new guard profile and assign to sites
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">Password *</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        placeholder="••••••••"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="employeeId">Employee ID *</Label>
                      <Input
                        id="employeeId"
                        value={formData.employeeId}
                        onChange={(e) => handleInputChange('employeeId', e.target.value)}
                        placeholder="GUARD001"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="+1234567890"
                      />
                    </div>
                    <div>
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        value={formData.department}
                        onChange={(e) => handleInputChange('department', e.target.value)}
                        placeholder="Security"
                      />
                    </div>
                    <div>
                      <Label htmlFor="hireDate">Hire Date</Label>
                      <Input
                        id="hireDate"
                        type="date"
                        value={formData.hireDate}
                        onChange={(e) => handleInputChange('hireDate', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="salary">Salary</Label>
                      <Input
                        id="salary"
                        value={formData.salary}
                        onChange={(e) => handleInputChange('salary', e.target.value)}
                        placeholder="35000"
                        type="number"
                      />
                    </div>
                  </div>

                  {/* Site Assignments */}
                  <div>
                    <Label>Site Assignments</Label>
                    <div className="mt-2 space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
                      {sites.map((site) => (
                        <div key={site.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={site.id}
                            checked={formData.siteIds.includes(site.id)}
                            onCheckedChange={(checked) => 
                              handleSiteSelection(site.id, checked as boolean)
                            }
                          />
                          <Label htmlFor={site.id} className="text-sm">
                            {site.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      Create Guard
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
                  placeholder="Search guards..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
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
          </div>
        </CardContent>
      </Card>

      {/* Guards Table */}
      <Card>
        <CardHeader>
          <CardTitle>Guard Directory</CardTitle>
          <CardDescription>
            {filteredGuards.length} guard{filteredGuards.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8 text-red-600">
              Error loading guards: {error}
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredGuards.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No guards found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Guard</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Sites</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGuards.map((guard) => (
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
                        <div className="space-y-1">
                          {guard.phone && (
                            <div className="flex items-center text-sm">
                              <Phone className="h-3 w-3 mr-1" />
                              {guard.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{guard.employeeId}</Badge>
                      </TableCell>
                      <TableCell>
                        {guard.department || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {guard.assignments.map((assignment: any, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {assignment.site.name}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{guard._count.attendances} attendances</div>
                          <div>{guard._count.patrols} patrols</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(guard.isActive)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-3 w-3" />
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