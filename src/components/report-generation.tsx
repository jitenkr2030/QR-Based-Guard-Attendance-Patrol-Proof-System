'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter,
  BarChart3,
  Users,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  Loader2
} from 'lucide-react'
import { useReports, useSites, useGuards } from '@/hooks/use-dashboard-data'
import { format } from 'date-fns'

interface ReportConfig {
  reportType: string
  startDate: string
  endDate: string
  format: 'json' | 'pdf'
  siteId?: string
  guardId?: string
}

export default function ReportGeneration() {
  const { reports, loading, error, generateReport } = useReports()
  const { sites } = useSites()
  const { guards } = useGuards()
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    reportType: '',
    startDate: '',
    endDate: '',
    format: 'json'
  })
  const [isGenerating, setIsGenerating] = useState(false)

  const reportTypes = [
    {
      value: 'DAILY_ATTENDANCE',
      label: 'Daily Attendance',
      description: 'Daily attendance records with check-in/out times',
      icon: <Calendar className="h-4 w-4" />
    },
    {
      value: 'MONTHLY_ATTENDANCE',
      label: 'Monthly Attendance',
      description: 'Monthly attendance summary with statistics',
      icon: <BarChart3 className="h-4 w-4" />
    },
    {
      value: 'GUARD_PERFORMANCE',
      label: 'Guard Performance',
      description: 'Individual guard performance metrics',
      icon: <Users className="h-4 w-4" />
    },
    {
      value: 'SITE_PERFORMANCE',
      label: 'Site Performance',
      description: 'Location-wise performance analytics',
      icon: <MapPin className="h-4 w-4" />
    },
    {
      value: 'PATROL_ACTIVITY',
      label: 'Patrol Activity',
      description: 'Patrol completion and activity reports',
      icon: <Clock className="h-4 w-4" />
    },
    {
      value: 'SERVICE_SUMMARY',
      label: 'Service Summary',
      description: 'Complete service overview for clients',
      icon: <FileText className="h-4 w-4" />
    }
  ]

  const handleGenerateReport = async () => {
    if (!reportConfig.reportType || !reportConfig.startDate || !reportConfig.endDate) {
      return
    }

    setIsGenerating(true)
    try {
      await generateReport(
        reportConfig.reportType,
        reportConfig.startDate,
        reportConfig.endDate,
        reportConfig.format,
        reportConfig.siteId,
        reportConfig.guardId
      )
    } catch (error) {
      console.error('Error generating report:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const getReportTypeIcon = (type: string) => {
    const reportType = reportTypes.find(rt => rt.value === type)
    return reportType?.icon || <FileText className="h-4 w-4" />
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Pending</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Generate Report
          </CardTitle>
          <CardDescription>
            Create custom reports for attendance, performance, and activities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="report-type">Report Type</Label>
              <Select 
                value={reportConfig.reportType} 
                onValueChange={(value) => setReportConfig(prev => ({ ...prev, reportType: value }))}
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
              <Label htmlFor="format">Format</Label>
              <Select 
                value={reportConfig.format} 
                onValueChange={(value: 'json' | 'pdf') => setReportConfig(prev => ({ ...prev, format: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={reportConfig.startDate}
                onChange={(e) => setReportConfig(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={reportConfig.endDate}
                onChange={(e) => setReportConfig(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="site">Site (Optional)</Label>
              <Select 
                value={reportConfig.siteId || ''} 
                onValueChange={(value) => setReportConfig(prev => ({ ...prev, siteId: value || undefined }))}
              >
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
              <Label htmlFor="guard">Guard (Optional)</Label>
              <Select 
                value={reportConfig.guardId || ''} 
                onValueChange={(value) => setReportConfig(prev => ({ ...prev, guardId: value || undefined }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All guards" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All guards</SelectItem>
                  {guards.map((guard) => (
                    <SelectItem key={guard.id} value={guard.id}>
                      {guard.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={handleGenerateReport} 
            disabled={!reportConfig.reportType || !reportConfig.startDate || !reportConfig.endDate || isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Quick Report Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Quick Templates
          </CardTitle>
          <CardDescription>
            Pre-configured report templates for common scenarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: 'Today\'s Attendance',
                description: 'Attendance records for today',
                type: 'DAILY_ATTENDANCE',
                dateRange: 'today'
              },
              {
                title: 'This Week\'s Summary',
                description: 'Complete weekly overview',
                type: 'SERVICE_SUMMARY',
                dateRange: 'week'
              },
              {
                title: 'Monthly Performance',
                description: 'Last 30 days performance',
                type: 'GUARD_PERFORMANCE',
                dateRange: 'month'
              }
            ].map((template, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      {getReportTypeIcon(template.type)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{template.title}</h3>
                      <p className="text-sm text-gray-500">{template.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      {reports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
            <CardDescription>
              Recently generated reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reports.map((report, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      {getReportTypeIcon(report.type)}
                    </div>
                    <div>
                      <h3 className="font-medium">{report.type.replace('_', ' ')}</h3>
                      <p className="text-sm text-gray-500">
                        {format(new Date(report.period.start), 'MMM dd, yyyy')} - {format(new Date(report.period.end), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge('completed')}
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              <span>Error generating report: {error}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}