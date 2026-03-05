import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { ReportType } from '@prisma/client'
import jsPDF from 'jspdf'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get('reportType') as ReportType
    const siteId = searchParams.get('siteId')
    const guardId = searchParams.get('guardId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const format = searchParams.get('format') // 'json' or 'pdf'

    if (!reportType || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Report type, start date, and end date are required' },
        { status: 400 }
      )
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999) // End of day

    let reportData

    switch (reportType) {
      case ReportType.DAILY_ATTENDANCE:
        reportData = await generateDailyAttendanceReport(start, end, siteId, guardId, session)
        break
      case ReportType.MONTHLY_ATTENDANCE:
        reportData = await generateMonthlyAttendanceReport(start, end, siteId, guardId, session)
        break
      case ReportType.GUARD_PERFORMANCE:
        reportData = await generateGuardPerformanceReport(start, end, siteId, guardId, session)
        break
      case ReportType.SITE_PERFORMANCE:
        reportData = await generateSitePerformanceReport(start, end, siteId, session)
        break
      case ReportType.PATROL_ACTIVITY:
        reportData = await generatePatrolActivityReport(start, end, siteId, guardId, session)
        break
      case ReportType.SERVICE_SUMMARY:
        reportData = await generateServiceSummaryReport(start, end, siteId, session)
        break
      default:
        return NextResponse.json(
          { error: 'Invalid report type' },
          { status: 400 }
        )
    }

    if (format === 'pdf') {
      const pdfBuffer = await generatePDF(reportData, reportType)
      
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${reportType}_${startDate}_${endDate}.pdf"`
        }
      })
    }

    return NextResponse.json(reportData)
  } catch (error) {
    console.error('Report generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function generateDailyAttendanceReport(start: Date, end: Date, siteId?: string, guardId?: string, session?: any) {
  const attendances = await db.attendance.findMany({
    where: {
      timestamp: {
        gte: start,
        lte: end
      },
      ...(siteId && { siteId }),
      ...(guardId && { guardId })
    },
    include: {
      guard: {
        include: {
          user: { select: { name: true, email: true } }
        }
      },
      site: { select: { name: true, address: true } },
      qrCode: { select: { name: true, location: true } }
    },
    orderBy: { timestamp: 'desc' }
  })

  // Group by date and guard
  const groupedData = attendances.reduce((acc: any, attendance) => {
    const date = attendance.timestamp.toISOString().split('T')[0]
    const guardId = attendance.guardId
    
    if (!acc[date]) acc[date] = {}
    if (!acc[date][guardId]) {
      acc[date][guardId] = {
        guard: attendance.guard,
        site: attendance.site,
        checkIn: null,
        checkOut: null,
        totalHours: 0
      }
    }
    
    if (attendance.type === 'CHECK_IN') {
      acc[date][guardId].checkIn = attendance
    } else {
      acc[date][guardId].checkOut = attendance
      if (acc[date][guardId].checkIn) {
        const hours = (attendance.timestamp.getTime() - acc[date][guardId].checkIn.timestamp.getTime()) / (1000 * 60 * 60)
        acc[date][guardId].totalHours = Math.round(hours * 100) / 100
      }
    }
    
    return acc
  }, {})

  return {
    type: 'DAILY_ATTENDANCE',
    period: { start, end },
    summary: {
      totalDays: Object.keys(groupedData).length,
      totalAttendances: attendances.length,
      uniqueGuards: new Set(attendances.map(a => a.guardId)).size
    },
    data: groupedData
  }
}

async function generateMonthlyAttendanceReport(start: Date, end: Date, siteId?: string, guardId?: string, session?: any) {
  const attendances = await db.attendance.findMany({
    where: {
      timestamp: {
        gte: start,
        lte: end
      },
      ...(siteId && { siteId }),
      ...(guardId && { guardId })
    },
    include: {
      guard: {
        include: {
          user: { select: { name: true, email: true } }
        }
      },
      site: { select: { name: true } }
    }
  })

  // Group by guard and month
  const monthlyData = attendances.reduce((acc: any, attendance) => {
    const month = attendance.timestamp.toISOString().substring(0, 7) // YYYY-MM
    const guardId = attendance.guardId
    
    if (!acc[month]) acc[month] = {}
    if (!acc[month][guardId]) {
      acc[month][guardId] = {
        guard: attendance.guard,
        site: attendance.site,
        presentDays: 0,
        absentDays: 0,
        lateDays: 0,
        totalHours: 0
      }
    }
    
    if (attendance.type === 'CHECK_IN') {
      acc[month][guardId].presentDays++
      // Check if late (after 9:00 AM)
      if (attendance.timestamp.getHours() > 9 || (attendance.timestamp.getHours() === 9 && attendance.timestamp.getMinutes() > 0)) {
        acc[month][guardId].lateDays++
      }
    }
    
    return acc
  }, {})

  return {
    type: 'MONTHLY_ATTENDANCE',
    period: { start, end },
    summary: {
      totalMonths: Object.keys(monthlyData).length,
      totalAttendances: attendances.length,
      uniqueGuards: new Set(attendances.map(a => a.guardId)).size
    },
    data: monthlyData
  }
}

async function generateGuardPerformanceReport(start: Date, end: Date, siteId?: string, guardId?: string, session?: any) {
  const guards = await db.guardProfile.findMany({
    where: {
      ...(guardId && { id: guardId }),
      ...(session?.user?.role === 'SUPERVISOR' && {
        assignments: {
          some: {
            site: {
              supervisorId: session.user.profile.id
            },
            isActive: true
          }
        }
      })
    },
    include: {
      user: { select: { name: true, email: true } },
      assignments: {
        where: { isActive: true },
        include: { site: { select: { name: true } } }
      },
      attendances: {
        where: {
          timestamp: { gte: start, lte: end },
          ...(siteId && { siteId })
        }
      },
      patrols: {
        where: {
          timestamp: { gte: start, lte: end },
          ...(siteId && { siteId })
        }
      },
      _count: {
        select: {
          attendances: true,
          patrols: true
        }
      }
    }
  })

  const performanceData = guards.map(guard => {
    const checkIns = guard.attendances.filter(a => a.type === 'CHECK_IN').length
    const checkOuts = guard.attendances.filter(a => a.type === 'CHECK_OUT').length
    const totalPatrols = guard.patrols.length
    const presentDays = new Set(guard.attendances.map(a => a.timestamp.toDateString())).size
    const lateDays = guard.attendances.filter(a => 
      a.type === 'CHECK_IN' && 
      (a.timestamp.getHours() > 9 || (a.timestamp.getHours() === 9 && a.timestamp.getMinutes() > 0))
    ).length

    return {
      guard,
      metrics: {
        presentDays,
        checkIns,
        checkOuts,
        totalPatrols,
        lateDays,
        attendanceRate: presentDays > 0 ? ((checkIns / presentDays) * 100).toFixed(2) : '0',
        punctualityRate: checkIns > 0 ? (((checkIns - lateDays) / checkIns) * 100).toFixed(2) : '0'
      }
    }
  })

  return {
    type: 'GUARD_PERFORMANCE',
    period: { start, end },
    summary: {
      totalGuards: guards.length,
      averageAttendance: performanceData.reduce((sum, g) => sum + parseFloat(g.metrics.attendanceRate), 0) / guards.length,
      averagePunctuality: performanceData.reduce((sum, g) => sum + parseFloat(g.metrics.punctualityRate), 0) / guards.length
    },
    data: performanceData
  }
}

async function generateSitePerformanceReport(start: Date, end: Date, siteId?: string, session?: any) {
  const sites = await db.site.findMany({
    where: {
      ...(siteId && { id: siteId }),
      ...(session?.user?.role === 'CLIENT' && { clientId: session.user.profile.id }),
      ...(session?.user?.role === 'SUPERVISOR' && { supervisorId: session.user.profile.id })
    },
    include: {
      client: { select: { companyName: true } },
      attendances: {
        where: {
          timestamp: { gte: start, lte: end }
        }
      },
      patrols: {
        where: {
          timestamp: { gte: start, lte: end }
        }
      },
      _count: {
        select: {
          assignments: true,
          qrCodes: true
        }
      }
    }
  })

  const siteData = sites.map(site => {
    const totalAttendances = site.attendances.length
    const totalPatrols = site.patrols.length
    const uniqueGuards = new Set(site.attendances.map(a => a.guardId)).size
    const checkIns = site.attendances.filter(a => a.type === 'CHECK_IN').length
    const missedPatrols = Math.max(0, (uniqueGuards * 4) - totalPatrols) // Assuming 4 patrols per guard per day

    return {
      site,
      metrics: {
        totalAttendances,
        totalPatrols,
        uniqueGuards,
        checkIns,
        missedPatrols,
        patrolCompletionRate: (uniqueGuards * 4) > 0 ? ((totalPatrols / (uniqueGuards * 4)) * 100).toFixed(2) : '0'
      }
    }
  })

  return {
    type: 'SITE_PERFORMANCE',
    period: { start, end },
    summary: {
      totalSites: sites.length,
      totalAttendances: siteData.reduce((sum, s) => sum + s.metrics.totalAttendances, 0),
      totalPatrols: siteData.reduce((sum, s) => sum + s.metrics.totalPatrols, 0)
    },
    data: siteData
  }
}

async function generatePatrolActivityReport(start: Date, end: Date, siteId?: string, guardId?: string, session?: any) {
  const patrols = await db.patrolScan.findMany({
    where: {
      timestamp: {
        gte: start,
        lte: end
      },
      ...(siteId && { siteId }),
      ...(guardId && { guardId })
    },
    include: {
      guard: {
        include: {
          user: { select: { name: true, email: true } }
        }
      },
      site: { select: { name: true } },
      qrCode: { select: { name: true, location: true } }
    },
    orderBy: { timestamp: 'desc' }
  })

  // Group by date and guard
  const patrolData = patrols.reduce((acc: any, patrol) => {
    const date = patrol.timestamp.toISOString().split('T')[0]
    const guardId = patrol.guardId
    
    if (!acc[date]) acc[date] = {}
    if (!acc[date][guardId]) {
      acc[date][guardId] = {
        guard: patrol.guard,
        site: patrol.site,
        patrolPoints: []
      }
    }
    
    acc[date][guardId].patrolPoints.push({
      sequence: patrol.sequence,
      location: patrol.location,
      timestamp: patrol.timestamp
    })
    
    return acc
  }, {})

  return {
    type: 'PATROL_ACTIVITY',
    period: { start, end },
    summary: {
      totalDays: Object.keys(patrolData).length,
      totalPatrols: patrols.length,
      uniqueGuards: new Set(patrols.map(p => p.guardId)).size
    },
    data: patrolData
  }
}

async function generateServiceSummaryReport(start: Date, end: Date, siteId?: string, session?: any) {
  const [attendanceData, patrolData, siteData] = await Promise.all([
    generateDailyAttendanceReport(start, end, siteId, undefined, session),
    generatePatrolActivityReport(start, end, siteId, undefined, session),
    generateSitePerformanceReport(start, end, siteId, session)
  ])

  return {
    type: 'SERVICE_SUMMARY',
    period: { start, end },
    attendance: attendanceData.summary,
    patrols: patrolData.summary,
    sites: siteData.summary,
    details: {
      attendance: attendanceData.data,
      patrols: patrolData.data,
      sites: siteData.data
    }
  }
}

async function generatePDF(data: any, reportType: string): Promise<Buffer> {
  const doc = new jsPDF()
  
  // Title
  doc.setFontSize(20)
  doc.text(reportType.replace('_', ' ').toUpperCase() + ' REPORT', 20, 20)
  
  // Period
  doc.setFontSize(12)
  doc.text(`Period: ${data.period.start.toLocaleDateString()} - ${data.period.end.toLocaleDateString()}`, 20, 35)
  
  // Summary
  let yPosition = 50
  doc.setFontSize(14)
  doc.text('Summary:', 20, yPosition)
  yPosition += 10
  
  doc.setFontSize(10)
  Object.entries(data.summary).forEach(([key, value]: [string, any]) => {
    doc.text(`${key}: ${value}`, 30, yPosition)
    yPosition += 8
  })
  
  // Add more details based on report type
  yPosition += 10
  doc.setFontSize(14)
  doc.text('Details:', 20, yPosition)
  yPosition += 10
  
  doc.setFontSize(10)
  if (reportType === 'DAILY_ATTENDANCE') {
    Object.entries(data.data).forEach(([date, guards]: [string, any]) => {
      doc.text(`Date: ${date}`, 30, yPosition)
      yPosition += 8
      Object.values(guards).forEach((guardData: any) => {
        doc.text(`  ${guardData.guard.user.name}: Check-in ${guardData.checkIn?.timestamp || 'N/A'}, Hours: ${guardData.totalHours}`, 40, yPosition)
        yPosition += 6
      })
      yPosition += 4
    })
  }
  
  return Buffer.from(doc.output('arraybuffer'))
}