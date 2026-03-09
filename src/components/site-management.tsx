'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { 
  Building, 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  QrCode,
  Users,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react'
import { useSites } from '@/hooks/use-dashboard-data'

interface SiteFormData {
  name: string
  address: string
  description: string
  clientId: string
  supervisorId: string
}

export default function SiteManagement() {
  const { sites, loading, error, fetchSites, createSite } = useSites()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState<SiteFormData>({
    name: '',
    address: '',
    description: '',
    clientId: '',
    supervisorId: ''
  })

  const filteredSites = sites.filter(site => 
    site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    site.address.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await createSite(formData)
      setIsAddDialogOpen(false)
      setFormData({
        name: '',
        address: '',
        description: '',
        clientId: '',
        supervisorId: ''
      })
    } catch (error) {
      console.error('Error creating site:', error)
    }
  }

  const handleInputChange = (field: keyof SiteFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive 
      ? <Badge className="bg-green-100 text-green-800">Active</Badge>
      : <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
  }

  const getSiteHealth = (site: any) => {
    const totalAttendances = site._count?.attendances || 0
    const totalPatrols = site._count?.patrols || 0
    const expectedPatrols = (site._count?.assignments || 0) * 4
    
    if (totalAttendances === 0) {
      return { status: 'warning', text: 'No Activity', color: 'yellow' }
    }
    
    if (totalPatrols < expectedPatrols * 0.8) {
      return { status: 'danger', text: 'Low Activity', color: 'red' }
    }
    
    return { status: 'success', text: 'Healthy', color: 'green' }
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Site Management</CardTitle>
              <CardDescription>
                Manage security sites and their configurations
              </CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Site
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Site</DialogTitle>
                  <DialogDescription>
                    Create a new security site location
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Site Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Main Office"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Address *</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="123 Business St, City, State"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Main corporate headquarters with 24/7 security"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="client">Client</Label>
                      <Input
                        id="client"
                        value={formData.clientId}
                        onChange={(e) => handleInputChange('clientId', e.target.value)}
                        placeholder="Client ID"
                      />
                    </div>
                    <div>
                      <Label htmlFor="supervisor">Supervisor</Label>
                      <Input
                        id="supervisor"
                        value={formData.supervisorId}
                        onChange={(e) => handleInputChange('supervisorId', e.target.value)}
                        placeholder="Supervisor ID"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      Create Site
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search sites..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Sites Table */}
      <Card>
        <CardHeader>
          <CardTitle>Site Directory</CardTitle>
          <CardDescription>
            {filteredSites.length} site{filteredSites.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8 text-red-600">
              Error loading sites: {error}
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredSites.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No sites found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Site</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Supervisor</TableHead>
                    <TableHead>Metrics</TableHead>
                    <TableHead>Health</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSites.map((site) => {
                    const health = getSiteHealth(site)
                    return (
                      <TableRow key={site.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <Building className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">{site.name}</div>
                              <div className="text-sm text-gray-500">{site.description}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3 text-gray-400" />
                            <span className="text-sm">{site.address}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{site.client?.companyName}</Badge>
                        </TableCell>
                        <TableCell>
                          {site.supervisor ? (
                            <div className="text-sm">
                              <div>{site.supervisor.user.name}</div>
                              <div className="text-gray-500">{site.supervisor.user.email}</div>
                            </div>
                          ) : (
                            <span className="text-gray-500">Not assigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm space-y-1">
                            <div className="flex items-center space-x-2">
                              <Users className="h-3 w-3" />
                              <span>{site._count?.assignments || 0} guards</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="h-3 w-3" />
                              <span>{site._count?.attendances || 0} attendances</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-3 w-3" />
                              <span>{site._count?.patrols || 0} patrols</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <AlertTriangle className={`h-4 w-4 text-${health.color}-500`} />
                            <span className={`text-${health.color}-600`}>{health.text}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(site.isActive)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              <QrCode className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}