'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Shield,
  Users,
  MapPin,
  BookOpen,
  Eye,
  Printer,
  Share,
  Clock,
  TrendingUp,
  Award,
  Scale,
  Building,
  UserCheck,
  Target
} from 'lucide-react'

interface PASARAReport {
  type: string
  period: { start: string; end: string }
  generatedAt: string
  data: any
}

interface ComplianceMetric {
  title: string
  value: string | number
  status: 'compliant' | 'non-compliant' | 'warning'
  description: string
  trend?: 'up' | 'down' | 'stable'
}

export default function PASARACompliance() {
  const [reports, setReports] = useState<PASARAReport[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    reportType: '',
    startDate: '',
    endDate: '',
    guardId: '',
    siteId: ''
  })
  const [generating, setGenerating] = useState(false)

  const complianceMetrics: ComplianceMetric[] = [
    {
      title: 'PASARA License',
      value: 'Category-A',
      status: 'compliant',
      description: 'License valid until Dec 2025',
      trend: 'stable'
    },
    {
      title: 'Guard Verification',
      value: '100%',
      status: 'compliant',
      description: 'All guards verified and certified',
      trend: 'up'
    },
    {
      title: 'Training Compliance',
      value: '92%',
      status: 'compliant',
      description: 'Most guards completed mandatory training',
      trend: 'up'
    },
    {
      title: 'Deployment Register',
      value: 'Maintained',
      status: 'compliant',
      description: 'All deployments properly documented',
      trend: 'stable'
    },
    {
      title: 'Incident Reporting',
      value: '100%',
      status: 'compliant',
      description: 'All incidents properly reported and documented',
      trend: 'stable'
    },
    {
      title: 'Client Service Level',
      value: '95.5%',
      status: 'compliant',
      description: 'Meeting or exceeding SLA requirements',
      trend: 'up'
    }
  ]

  const reportTypes = [
    {
      value: 'GUARD_VERIFICATION',
      label: 'Guard Verification Report',
      description: 'Complete guard identity and verification details',
      icon: <UserCheck className="h-4 w-4" />
    },
    {
      value: 'GUARD_DEPLOYMENT',
      label: 'Guard Deployment Register',
      description: 'Comprehensive record of guard deployments',
      icon: <MapPin className="h-4 w-4" />
    },
    {
      value: 'TRAINING_COMPLETION',
      label: 'Training Completion Report',
      description: 'Training records and certification status',
      icon: <BookOpen className="h-4 w-4" />
    },
    {
      value: 'INCIDENT_REPORT',
      label: 'Incident Report',
      description: 'Security incidents and resolutions',
      icon: <AlertTriangle className="h-4 w-4" />
    },
    {
      value: 'PASARA_COMPLIANCE',
      label: 'PASARA Compliance Report',
      description: 'Complete compliance status and metrics',
      icon: <Scale className="h-4 w-4" />
    }
  ]

  const handleGenerateReport = async (format: 'json' | 'pdf' = 'json') => {
    if (!formData.reportType || !formData.startDate || !formData.endDate) {
      setError('Please select report type and date range')
      return
    }

    setGenerating(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        reportType: formData.reportType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        format,
        ...(formData.guardId && { guardId: formData.guardId }),
        ...(formData.siteId && { siteId: formData.siteId })
      })

      const response = await fetch(`/api/pasara-reports?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to generate report')
      }

      if (format === 'pdf') {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${formData.reportType}_PASARA_${formData.startDate}.pdf`
        a.click()
        window.URL.revokeObjectURL(url)
      } else {
        const reportData = await response.json()
        setReports(prev => [reportData, ...prev])
      }
    } catch (error: any) {
      console.error('Error generating report:', error)
      setError(error.message || 'Failed to generate report')
    } finally {
      setGenerating(false)
    }
  }

  const getMetricColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'text-green-600'
      case 'non-compliant':
        return 'text-red-600'
      case 'warning':
        return 'text-yellow-600'
      default:
        return 'text-gray-600'
    }
  }

  const getMetricIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'non-compliant':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'compliant':
        return <Badge className="bg-green-100 text-green-800">Compliant</Badge>
      case 'non-compliant':
        return <Badge className="bg-red-100 text-red-800">Non-Compliant</Badge>
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">PASARA Compliance</h1>
          <p className="text-gray-600 mt-2">
            Automated compliance reporting for Private Security Agencies Regulation Act 2005
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            Print Compliance
          </Button>
          <Button>
            <Shield className="h-4 w-4 mr-2" />
            Audit Ready
          </Button>
        </div>
      </div>

      {/* Compliance Overview */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {complianceMetrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <div className="flex items-center space-x-1">
                {getMetricIcon(metric.status)}
                {metric.trend && (
                  metric.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : metric.trend === 'down' ? (
                    <TrendingUp className="h-4 w-4 text-red-500 transform rotate-180" />
                  ) : (
                    <Target className="h-4 w-4 text-gray-500" />
                  )
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{metric.value}</div>
                {getStatusBadge(metric.status)}
              </div>
              <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Report Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Generate Compliance Reports
          </CardTitle>
          <CardDescription>
            Create PASARA-compliant reports for audits and inspections
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="report-type">Report Type *</Label>
              <Select 
                value={formData.reportType} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, reportType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center space-x-2">
                        {type.icon}
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-sm text-gray-500">{type.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="start-date">Start Date *</Label>
              <Input
                id="start-date"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
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
              />
            </div>

            <div>
              <Label htmlFor="guard">Guard (Optional)</Label>
              <Select 
                value={formData.guardId} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, guardId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All guards" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All guards</SelectItem>
                  {/* Would fetch from API */}
                  <SelectItem value="guard1">John Doe</SelectItem>
                  <SelectItem value="guard2">Jane Smith</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="site">Site (Optional)</Label>
              <Select 
                value={formData.siteId} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, siteId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All sites" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All sites</SelectItem>
                  <SelectItem value="site1">Main Office</SelectItem>
                  <SelectItem value="site2">Warehouse</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => handleGenerateReport('json')}
              disabled={generating || !formData.reportType || !formData.startDate || !formData.endDate}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button 
              onClick={() => handleGenerateReport('pdf')}
              disabled={generating || !formData.reportType || !formData.startDate || !formData.endDate}
            >
              {generating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>Generated compliance reports</CardDescription>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No reports generated yet
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{report.type.replace('_', ' ')}</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(new Date(report.period.start))} - {formatDate(new Date(report.period.end))}
                      </p>
                      <p className="text-xs text-gray-400">
                        Generated: {formatDate(new Date(report.generatedAt))}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Compliance Requirements */}
      <Tabs defaultValue="requirements" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
          <TabsTrigger value="checklist">Checklist</TabsTrigger>
          <TabsTrigger value="audit">Audit Prep</TabsTrigger>
          <TabsTrigger value="violations">Violations</TabsTrigger>
        </TabsList>

        <TabsContent value="requirements">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Scale className="h-5 w-5 mr-2" />
                  PASARA Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      category: 'Personnel Management',
                      requirements: [
                        'All guards must be verified and background checked',
                        'Police verification mandatory for all guards',
                        'Training certificates must be maintained',
                        'Guard deployment register must be updated'
                      ]
                    },
                    {
                      category: 'Training Requirements',
                      requirements: [
                        'Basic security training (40 hours)',
                        'Fire safety training (16 hours)',
                        'Emergency response training (24 hours)',
                        'Refresher training every 2 years'
                      ]
                    },
                    {
                      category: 'Documentation',
                      requirements: [
                        'Guard verification records',
                        'Training completion certificates',
                        'Incident reports with timelines',
                        'Deployment registers with dates'
                      ]
                    },
                    {
                      category: 'Operational',
                      requirements: [
                        '24/7 guard deployment for critical sites',
                        'Incident reporting within 30 minutes',
                        'Client notification for major incidents',
                        'Regular patrol documentation'
                      ]
                    }
                  ].map((category, index) => (
                    <Card key={index} className="border-l-4 border-l-blue-500">
                      <CardHeader>
                        <CardTitle className="text-lg">{category.category}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {category.requirements.map((req, reqIndex) => (
                            <li key={reqIndex} className="flex items-center space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                              <span className="text-sm">{req}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="checklist">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Checklist</CardTitle>
              <CardDescription>Daily, weekly, and monthly compliance checks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  {
                    frequency: 'Daily',
                    items: [
                      'Guard attendance verification',
                      'Patrol completion check',
                      'Incident log review',
                      'Equipment status check'
                    ]
                  },
                  {
                    frequency: 'Weekly',
                    items: [
                      'Training certificate expiry check',
                      'Guard deployment register update',
                      'Client service level review',
                      'Incident trend analysis'
                    ]
                  },
                  {
                    frequency: 'Monthly',
                    items: [
                      'Complete PASARA compliance review',
                      'License validity check',
                      'Insurance coverage verification',
                      'Staff background check renewal'
                    ]
                  },
                  {
                    frequency: 'Quarterly',
                    items: [
                      'External audit preparation',
                      'Management review meeting',
                      'Risk assessment update',
                      'Compliance report generation'
                    ]
                  }
                ].map((checklist, index) => (
                  <Card key={index} className="border-l-4 border-l-green-500">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {checklist.frequency} Checklist
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {checklist.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex items-center space-x-2">
                            <input type="checkbox" className="rounded" />
                            <span className="text-sm">{item}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Audit Preparation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <Alert>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription>
                    <strong>Audit Ready:</strong> Your compliance score is 94%. You're well-prepared for PASARA audits.
                  </AlertDescription>
                </Alert>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Required Documents</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        'PASARA License Certificate',
                        'Guard Verification Reports',
                        'Training Completion Certificates',
                        'Guard Deployment Register',
                        'Incident Reports (Last 6 months)',
                        'Insurance Coverage Documents',
                        'Client Service Agreements'
                      ].map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm">{doc}</span>
                          <Badge className="bg-green-100 text-green-800 text-xs">Ready</Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Audit Timeline</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        { phase: 'Pre-Audit', date: '30 days before', status: 'completed' },
                        { phase: 'Document Review', date: '15 days before', status: 'in-progress' },
                        { phase: 'On-site Audit', date: 'Scheduled', status: 'pending' },
                        { phase: 'Report Submission', date: 'Within 7 days', status: 'pending' }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <p className="font-medium text-sm">{item.phase}</p>
                            <p className="text-xs text-gray-500">{item.date}</p>
                          </div>
                          <div className="text-right">
                            <Badge 
                              className={
                                item.status === 'completed' ? 'bg-green-100 text-green-800' :
                                item.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }
                              text-xs
                            >
                              {item.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="violations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <XCircle className="h-5 w-5 mr-2" />
                Violations & Corrective Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  <strong>No Open Violations:</strong> All compliance issues have been resolved.
                </AlertDescription>
              </Alert>

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Resolved Violations</h3>
                <div className="space-y-4">
                  {[
                    {
                      violation: 'Missing Training Certificates',
                      date: '2024-10-15',
                      severity: 'High',
                      status: 'Resolved',
                      action: 'Conducted emergency training for all affected guards',
                      resolvedDate: '2024-10-20'
                    },
                    {
                      violation: 'Incomplete Deployment Register',
                      date: '2024-09-30',
                      severity: 'Medium',
                      status: 'Resolved',
                      action: 'Updated register with all current deployments',
                      resolvedDate: '2024-10-05'
                    }
                  ].map((violation, index) => (
                    <Card key={index} className="border-l-4 border-l-green-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{violation.violation}</h4>
                            <p className="text-sm text-gray-500 mt-1">
                              Detected: {violation.date} | Severity: {violation.severity}
                            </p>
                            <p className="text-sm text-gray-600 mt-2">
                              Action: {violation.action}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge className="bg-green-100 text-green-800">
                              Resolved {violation.resolvedDate}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )

  function formatDate(date: Date): string {
    return date.toLocaleDateString('en-IN')
  }
}