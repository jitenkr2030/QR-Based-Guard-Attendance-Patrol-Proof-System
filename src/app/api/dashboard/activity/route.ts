import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let activities = []

    if (session.user.role === 'ADMIN') {
      // Admin can see all activity
      const [recentAttendances, recentPatrols, leaveRequests] = await Promise.all([
        db.attendance.findMany({
          where: {
            timestamp: { gte: today }
          },
          include: {
            guard: {
              include: {
                user: { select: { name: true } }
              }
            },
            site: { select: { name: true } },
            qrCode: { select: { location: true } }
          },
          orderBy: { timestamp: 'desc' },
          take: 10
        }),
        db.patrolScan.findMany({
          where: {
            timestamp: { gte: today }
          },
          include: {
            guard: {
              include: {
                user: { select: { name: true } }
              }
            },
            site: { select: { name: true } },
            qrCode: { select: { location: true } }
          },
          orderBy: { timestamp: 'desc' },
          take: 5
        }),
        db.leaveRequest.findMany({
          where: {
            createdAt: { gte: today }
          },
          include: {
            guard: {
              include: {
                user: { select: { name: true } }
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        })
      ])

      // Format activities
      activities = [
        ...recentAttendances.map(att => ({
          id: att.id,
          type: 'attendance',
          title: `${att.guard.user.name} ${att.type === 'CHECK_IN' ? 'checked in' : 'checked out'}`,
          description: `at ${att.site.name} - ${att.location || 'Main Entrance'}`,
          timestamp: att.timestamp,
          icon: 'check-circle',
          color: att.type === 'CHECK_IN' ? 'green' : 'blue'
        })),
        ...recentPatrols.map(patrol => ({
          id: patrol.id,
          type: 'patrol',
          title: `${patrol.guard.user.name} completed patrol`,
          description: `at ${patrol.site.name} - ${patrol.location || 'Patrol Point'}`,
          timestamp: patrol.timestamp,
          icon: 'map-pin',
          color: 'blue'
        })),
        ...leaveRequests.map(leave => ({
          id: leave.id,
          type: 'leave',
          title: `${leave.guard.user.name} submitted leave request`,
          description: `${leave.reason.substring(0, 50)}...`,
          timestamp: leave.createdAt,
          icon: 'calendar',
          color: leave.status === 'PENDING' ? 'yellow' : leave.status === 'APPROVED' ? 'green' : 'red'
        }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10)
    } else if (session.user.role === 'SUPERVISOR') {
      // Supervisor can see activity for their assigned sites
      const supervisorProfile = await db.supervisorProfile.findUnique({
        where: { userId: session.user.id }
      })

      if (!supervisorProfile) {
        return NextResponse.json(
          { error: 'Supervisor profile not found' },
          { status: 404 }
        )
      }

      const [recentAttendances, recentPatrols] = await Promise.all([
        db.attendance.findMany({
          where: {
            timestamp: { gte: today },
            guard: {
              assignments: {
                some: {
                  site: { supervisorId: supervisorProfile.id },
                  isActive: true
                }
              }
            }
          },
          include: {
            guard: {
              include: {
                user: { select: { name: true } }
              }
            },
            site: { select: { name: true } },
            qrCode: { select: { location: true } }
          },
          orderBy: { timestamp: 'desc' },
          take: 10
        }),
        db.patrolScan.findMany({
          where: {
            timestamp: { gte: today },
            guard: {
              assignments: {
                some: {
                  site: { supervisorId: supervisorProfile.id },
                  isActive: true
                }
              }
            }
          },
          include: {
            guard: {
              include: {
                user: { select: { name: true } }
              }
            },
            site: { select: { name: true } },
            qrCode: { select: { location: true } }
          },
          orderBy: { timestamp: 'desc' },
          take: 5
        })
      ])

      activities = [
        ...recentAttendances.map(att => ({
          id: att.id,
          type: 'attendance',
          title: `${att.guard.user.name} ${att.type === 'CHECK_IN' ? 'checked in' : 'checked out'}`,
          description: `at ${att.site.name} - ${att.location || 'Main Entrance'}`,
          timestamp: att.timestamp,
          icon: 'check-circle',
          color: att.type === 'CHECK_IN' ? 'green' : 'blue'
        })),
        ...recentPatrols.map(patrol => ({
          id: patrol.id,
          type: 'patrol',
          title: `${patrol.guard.user.name} completed patrol`,
          description: `at ${patrol.site.name} - ${patrol.location || 'Patrol Point'}`,
          timestamp: patrol.timestamp,
          icon: 'map-pin',
          color: 'blue'
        }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10)
    } else if (session.user.role === 'CLIENT') {
      // Client can see activity for their sites
      const clientProfile = await db.clientProfile.findUnique({
        where: { userId: session.user.id }
      })

      if (!clientProfile) {
        return NextResponse.json(
          { error: 'Client profile not found' },
          { status: 404 }
        )
      }

      const recentAttendances = await db.attendance.findMany({
        where: {
          timestamp: { gte: today },
          site: { clientId: clientProfile.id }
        },
        include: {
          guard: {
            include: {
              user: { select: { name: true } }
            }
          },
          site: { select: { name: true } },
          qrCode: { select: { location: true } }
        },
        orderBy: { timestamp: 'desc' },
        take: 10
      })

      activities = recentAttendances.map(att => ({
        id: att.id,
        type: 'attendance',
        title: `${att.guard.user.name} ${att.type === 'CHECK_IN' ? 'checked in' : 'checked out'}`,
        description: `at ${att.site.name} - ${att.location || 'Main Entrance'}`,
        timestamp: att.timestamp,
        icon: 'check-circle',
        color: att.type === 'CHECK_IN' ? 'green' : 'blue'
      }))
    } else {
      // Guards can only see their own activity
      const guardProfile = await db.guardProfile.findUnique({
        where: { userId: session.user.id }
      })

      if (!guardProfile) {
        return NextResponse.json(
          { error: 'Guard profile not found' },
          { status: 404 }
        )
      }

      const [recentAttendances, recentPatrols] = await Promise.all([
        db.attendance.findMany({
          where: {
            guardId: guardProfile.id,
            timestamp: { gte: today }
          },
          include: {
            guard: {
              include: {
                user: { select: { name: true } }
              }
            },
            site: { select: { name: true } },
            qrCode: { select: { location: true } }
          },
          orderBy: { timestamp: 'desc' },
          take: 10
        }),
        db.patrolScan.findMany({
          where: {
            guardId: guardProfile.id,
            timestamp: { gte: today }
          },
          include: {
            guard: {
              include: {
                user: { select: { name: true } }
              }
            },
            site: { select: { name: true } },
            qrCode: { select: { location: true } }
          },
          orderBy: { timestamp: 'desc' },
          take: 5
        })
      ])

      activities = [
        ...recentAttendances.map(att => ({
          id: att.id,
          type: 'attendance',
          title: `You ${att.type === 'CHECK_IN' ? 'checked in' : 'checked out'}`,
          description: `at ${att.site.name} - ${att.location || 'Main Entrance'}`,
          timestamp: att.timestamp,
          icon: 'check-circle',
          color: att.type === 'CHECK_IN' ? 'green' : 'blue'
        })),
        ...recentPatrols.map(patrol => ({
          id: patrol.id,
          type: 'patrol',
          title: `You completed patrol`,
          description: `at ${patrol.site.name} - ${patrol.location || 'Patrol Point'}`,
          timestamp: patrol.timestamp,
          icon: 'map-pin',
          color: 'blue'
        }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10)
    }

    return NextResponse.json(activities)
  } catch (error) {
    console.error('Dashboard activity error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}