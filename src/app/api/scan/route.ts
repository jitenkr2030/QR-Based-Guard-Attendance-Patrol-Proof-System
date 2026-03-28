import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { AttendanceType, QRCodeType } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { qrCodeData, attendanceType } = await request.json()

    // Parse QR code data
    let qrData
    try {
      qrData = JSON.parse(qrCodeData)
    } catch {
      return NextResponse.json(
        { error: 'Invalid QR code format' },
        { status: 400 }
      )
    }

    // Find QR code in database
    const qrCode = await db.qRCode.findUnique({
      where: { code: qrData.code },
      include: { site: true }
    })

    if (!qrCode || !qrCode.isActive) {
      return NextResponse.json(
        { error: 'Invalid or inactive QR code' },
        { status: 400 }
      )
    }

    // Get guard profile
    const guardProfile = await db.guardProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!guardProfile) {
      return NextResponse.json(
        { error: 'Guard profile not found' },
        { status: 404 }
      )
    }

    // Check if guard is assigned to this site
    const assignment = await db.siteAssignment.findFirst({
      where: {
        guardId: guardProfile.id,
        siteId: qrCode.siteId,
        isActive: true,
        OR: [
          { endDate: null },
          { endDate: { gte: new Date() } }
        ]
      }
    })

    if (!assignment) {
      return NextResponse.json(
        { error: 'Guard not assigned to this site' },
        { status: 403 }
      )
    }

    // For attendance QR codes, check for duplicate scans
    if (qrCode.type === QRCodeType.ATTENDANCE) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const existingAttendance = await db.attendance.findFirst({
        where: {
          guardId: guardProfile.id,
          siteId: qrCode.siteId,
          type: attendanceType,
          timestamp: {
            gte: today
          }
        }
      })

      if (existingAttendance) {
        return NextResponse.json(
          { error: `Already checked ${attendanceType === AttendanceType.CHECK_IN ? 'in' : 'out'} today` },
          { status: 400 }
        )
      }
    }

    // Create attendance or patrol record
    if (qrCode.type === QRCodeType.ATTENDANCE) {
      const attendance = await db.attendance.create({
        data: {
          guardId: guardProfile.id,
          siteId: qrCode.siteId,
          qrCodeId: qrCode.id,
          type: attendanceType,
          location: qrCode.location,
          ipAddress: request.ip || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        },
        include: {
          guard: { include: { user: { select: { name: true } } } },
          site: { select: { name: true } },
          qrCode: { select: { name: true } }
        }
      })

      return NextResponse.json({
        success: true,
        message: `Checked ${attendanceType === AttendanceType.CHECK_IN ? 'in' : 'out'} successfully`,
        data: attendance
      })
    } else if (qrCode.type === QRCodeType.PATROL_POINT) {
      // Get patrol sequence number
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const lastPatrol = await db.patrolScan.findFirst({
        where: {
          guardId: guardProfile.id,
          siteId: qrCode.siteId,
          timestamp: { gte: today }
        },
        orderBy: { sequence: 'desc' }
      })

      const sequence = (lastPatrol?.sequence || 0) + 1

      const patrol = await db.patrolScan.create({
        data: {
          guardId: guardProfile.id,
          siteId: qrCode.siteId,
          qrCodeId: qrCode.id,
          sequence,
          location: qrCode.location,
          ipAddress: request.ip || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        },
        include: {
          guard: { include: { user: { select: { name: true } } } },
          site: { select: { name: true } },
          qrCode: { select: { name: true } }
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Patrol point scanned successfully',
        data: patrol
      })
    }

    return NextResponse.json(
      { error: 'Invalid QR code type' },
      { status: 400 }
    )
  } catch (error) {
    console.error('QR scan error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}