'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  QrCode, 
  Camera, 
  CheckCircle, 
  Clock, 
  MapPin, 
  AlertTriangle,
  User,
  History
} from 'lucide-react'

export default function GuardScanner() {
  const [isScanning, setIsScanning] = useState(false)
  const [lastScan, setLastScan] = useState<any>(null)
  const [todayAttendance, setTodayAttendance] = useState<any[]>([])
  const [todayPatrols, setTodayPatrols] = useState<any[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // For demo purposes, we'll simulate QR code scanning
      // In a real implementation, you'd use a QR code library to decode the image
      simulateQRScan()
    }
  }

  const simulateQRScan = () => {
    // Simulate QR code data
    const qrData = JSON.stringify({
      code: 'demo-qr-code-' + Date.now(),
      type: 'ATTENDANCE',
      siteId: 'demo-site-1',
      timestamp: new Date().toISOString()
    })

    // Simulate API call
    scanQRCode(qrData, 'CHECK_IN')
  }

  const scanQRCode = async (qrData: string, attendanceType: string) => {
    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          qrCodeData: qrData,
          attendanceType
        })
      })

      const result = await response.json()

      if (result.success) {
        setLastScan(result.data)
        setIsScanning(false)
        
        // Refresh attendance/patrol data
        fetchTodayData()
      } else {
        alert(result.error || 'Scan failed')
      }
    } catch (error) {
      console.error('Scan error:', error)
      alert('Scan failed. Please try again.')
    }
  }

  const fetchTodayData = () => {
    // Simulate fetching today's data
    setTodayAttendance([
      {
        id: '1',
        type: 'CHECK_IN',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        siteName: 'Main Office',
        location: 'Main Entrance'
      }
    ])

    setTodayPatrols([
      {
        id: '1',
        sequence: 1,
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        location: 'Main Gate',
        siteName: 'Main Office'
      },
      {
        id: '2',
        sequence: 2,
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        location: 'Parking Area',
        siteName: 'Main Office'
      }
    ])
  }

  useEffect(() => {
    fetchTodayData()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Guard Mobile Portal</h1>
          <p className="text-gray-600">Scan QR codes for attendance and patrol verification</p>
        </header>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Guard Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Name:</strong> John Doe</p>
                <p><strong>Employee ID:</strong> GUARD001</p>
                <p><strong>Department:</strong> Security</p>
                <Badge className="bg-green-100 text-green-800">On Duty</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Today's Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Check-in:</span>
                  <span className="font-medium">8:00 AM</span>
                </div>
                <div className="flex justify-between">
                  <span>Patrols Completed:</span>
                  <span className="font-medium">2/4</span>
                </div>
                <div className="flex justify-between">
                  <span>Shift Status:</span>
                  <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="scanner" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="scanner">QR Scanner</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="patrols">Patrols</TabsTrigger>
          </TabsList>

          <TabsContent value="scanner">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <QrCode className="h-5 w-5 mr-2" />
                  QR Code Scanner
                </CardTitle>
                <CardDescription>
                  Scan QR codes to mark attendance or patrol points
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Button 
                    onClick={() => setIsScanning(true)}
                    className="h-24 flex-col"
                    disabled={isScanning}
                  >
                    <Camera className="h-8 w-8 mb-2" />
                    {isScanning ? 'Scanning...' : 'Start Camera Scan'}
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-24 flex-col"
                  >
                    <QrCode className="h-8 w-8 mb-2" />
                    Upload QR Image
                  </Button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {isScanning && (
                  <Alert>
                    <Camera className="h-4 w-4" />
                    <AlertDescription>
                      Camera scanning would be implemented here. For demo, click "Upload QR Image" to simulate a scan.
                    </AlertDescription>
                  </Alert>
                )}

                {lastScan && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      <strong>Scan Successful!</strong><br />
                      {lastScan.type === 'CHECK_IN' ? 'Checked in' : 'Checked out'} at {lastScan.site.name} - {lastScan.location}
                      <br />
                      <small>{new Date(lastScan.timestamp).toLocaleString()}</small>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Attendance History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {todayAttendance.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No attendance records for today</p>
                  ) : (
                    todayAttendance.map((record) => (
                      <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <div>
                            <p className="font-medium">{record.type === 'CHECK_IN' ? 'Check In' : 'Check Out'}</p>
                            <p className="text-sm text-gray-500">{record.siteName} - {record.location}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{new Date(record.timestamp).toLocaleTimeString()}</p>
                          <p className="text-sm text-gray-500">{new Date(record.timestamp).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="patrols">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Patrol Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {todayPatrols.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No patrol records for today</p>
                  ) : (
                    todayPatrols.map((patrol) => (
                      <div key={patrol.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <MapPin className="h-4 w-4 text-blue-500" />
                          <div>
                            <p className="font-medium">Patrol Point {patrol.sequence}</p>
                            <p className="text-sm text-gray-500">{patrol.location} - {patrol.siteName}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{new Date(patrol.timestamp).toLocaleTimeString()}</p>
                          <p className="text-sm text-gray-500">{new Date(patrol.timestamp).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}