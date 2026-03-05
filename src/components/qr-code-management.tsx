'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  QrCode, 
  Download, 
  Search, 
  Filter,
  Plus,
  Eye,
  Trash2,
  MapPin,
  Building,
  Copy,
  Printer,
  Share,
  CheckCircle
} from 'lucide-react'
import { useSites } from '@/hooks/use-dashboard-data'

interface QRCodeData {
  id: string
  code: string
  type: 'ATTENDANCE' | 'PATROL_POINT'
  name: string
  description?: string
  siteName: string
  location?: string
  qrImage: string
  isActive: boolean
  createdAt: string
}

export default function QRCodeManagement() {
  const { sites } = useSites()
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSite, setSelectedSite] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [formData, setFormData] = useState({
    siteId: '',
    type: 'ATTENDANCE' as 'ATTENDANCE' | 'PATROL_POINT',
    name: '',
    description: '',
    location: ''
  })
  const [generating, setGenerating] = useState(false)

  const fetchQRCodes = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedSite) params.append('siteId', selectedSite)
      
      const response = await fetch(`/api/qrcodes?${params}`)
      if (!response.ok) throw new Error('Failed to fetch QR codes')
      
      const data = await response.json()
      setQrCodes(data)
    } catch (error) {
      console.error('Error fetching QR codes:', error)
      setError('Failed to load QR codes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQRCodes()
  }, [selectedSite])

  const handleGenerateQR = async () => {
    setGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/qrcodes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate QR code')
      }

      const newQR = await response.json()
      setQrCodes(prev => [newQR, ...prev])
      setIsAddDialogOpen(false)
      setFormData({
        siteId: '',
        type: 'ATTENDANCE',
        name: '',
        description: '',
        location: ''
      })
    } catch (error: any) {
      console.error('Error generating QR code:', error)
      setError(error.message || 'Failed to generate QR code')
    } finally {
      setGenerating(false)
    }
  }

  const handleDownloadQR = (qrCode: QRCodeData, format: 'png' | 'svg' | 'pdf' = 'png') => {
    // Create download link for QR code image
    const link = document.createElement('a')
    link.href = qrCode.qrImage
    link.download = `${qrCode.name}_${qrCode.code}.${format}`
    link.click()
  }

  const handlePrintQR = (qrCode: QRCodeData) => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${qrCode.name}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                text-align: center; 
                padding: 20px;
              }
              .qr-code { 
                margin: 20px auto; 
                max-width: 300px;
              }
              .info { 
                margin: 20px 0;
              }
            </style>
          </head>
          <body>
            <h1>${qrCode.name}</h1>
            <div class="info">
              <p><strong>Site:</strong> ${qrCode.siteName}</p>
              <p><strong>Type:</strong> ${qrCode.type.replace('_', ' ')}</p>
              <p><strong>Location:</strong> ${qrCode.location || 'N/A'}</p>
              <p><strong>Code:</strong> ${qrCode.code}</p>
            </div>
            <div class="qr-code">
              <img src="${qrCode.qrImage}" alt="${qrCode.name}" style="width: 100%;" />
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    // Show success message (you could add a toast notification here)
  }

  const filteredQRCodes = qrCodes.filter(qr => 
    qr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    qr.siteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    qr.location?.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(qr => 
    !selectedType || qr.type === selectedType
  )

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'ATTENDANCE':
        return <Badge className="bg-blue-100 text-blue-800">Attendance</Badge>
      case 'PATROL_POINT':
        return <Badge className="bg-green-100 text-green-800">Patrol Point</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{type}</Badge>
    }
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
              <CardTitle className="flex items-center">
                <QrCode className="h-5 w-5 mr-2" />
                QR Code Management
              </CardTitle>
              <CardDescription>
                Generate and manage QR codes for attendance and patrol points
              </CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Generate QR Code
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Generate New QR Code</DialogTitle>
                  <DialogDescription>
                    Create a QR code for attendance marking or patrol verification
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleGenerateQR} className="space-y-6">
                  {error && (
                    <div className="p-3 border border-red-200 bg-red-50 rounded-md">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="site">Site *</Label>
                      <Select 
                        value={formData.siteId} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, siteId: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select site" />
                        </SelectTrigger>
                        <SelectContent>
                          {sites.map((site) => (
                            <SelectItem key={site.id} value={site.id}>
                              {site.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="type">QR Type *</Label>
                      <Select 
                        value={formData.type} 
                        onValueChange={(value: 'ATTENDANCE' | 'PATROL_POINT') => 
                          setFormData(prev => ({ ...prev, type: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ATTENDANCE">Attendance</SelectItem>
                          <SelectItem value="PATROL_POINT">Patrol Point</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="name">QR Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Main Entrance Attendance"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="Main Entrance"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Primary entrance for attendance marking"
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setIsAddDialogOpen(false)
                        setError(null)
                        setFormData({
                          siteId: '',
                          type: 'ATTENDANCE',
                          name: '',
                          description: '',
                          location: ''
                        })
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={generating}>
                      {generating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <QrCode className="h-4 w-4 mr-2" />
                          Generate QR
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
                  placeholder="Search QR codes..."
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
                    <SelectItem key={site.id} value={site.id}>
                      {site.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All types</SelectItem>
                  <SelectItem value="ATTENDANCE">Attendance</SelectItem>
                  <SelectItem value="PATROL_POINT">Patrol Point</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* QR Codes Table */}
      <Card>
        <CardHeader>
          <CardTitle>QR Code Directory</CardTitle>
          <CardDescription>
            {filteredQRCodes.length} QR code{filteredQRCodes.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredQRCodes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No QR codes found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>QR Code</TableHead>
                    <TableHead>Site</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQRCodes.map((qr) => (
                    <TableRow key={qr.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-16 h-16 bg-white border rounded-lg p-1">
                            <img 
                              src={qr.qrImage} 
                              alt={qr.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div>
                            <div className="font-medium">{qr.name}</div>
                            <div className="text-sm text-gray-500">{qr.description}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Building className="h-3 w-3 text-gray-400" />
                          <span className="text-sm">{qr.siteName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getTypeBadge(qr.type)}
                      </TableCell>
                      <TableCell>
                        {qr.location || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {qr.code.substring(0, 8)}...
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyCode(qr.code)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(qr.isActive)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadQR(qr)}
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePrintQR(qr)}
                          >
                            <Printer className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                          >
                            <Share className="h-3 w-3" />
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

      {/* Bulk Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Printer className="h-5 w-5 mr-2" />
            Bulk Actions
          </CardTitle>
          <CardDescription>
            Download or print multiple QR codes at once
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <Download className="h-8 w-8 text-blue-500 mb-2" />
                <h3 className="font-semibold">Download All</h3>
                <p className="text-sm text-gray-600">Download all QR codes as ZIP</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <Printer className="h-8 w-8 text-green-500 mb-2" />
                <h3 className="font-semibold">Print All</h3>
                <p className="text-sm text-gray-600">Print all QR codes</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <Share className="h-8 w-8 text-purple-500 mb-2" />
                <h3 className="font-semibold">Share Site</h3>
                <p className="text-sm text-gray-600">Share site QR codes</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <CheckCircle className="h-8 w-8 text-orange-500 mb-2" />
                <h3 className="font-semibold">Validate QRs</h3>
                <p className="text-sm text-gray-600">Check QR code integrity</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}