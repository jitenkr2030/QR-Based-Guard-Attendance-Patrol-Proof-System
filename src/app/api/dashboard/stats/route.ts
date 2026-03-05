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

    let stats = {
      totalGuards: 0,
      activeSites: 0,
      todayAttendance: 0,
      patrolCompletion: 0,
      lateCheckins: 0,
      missedPatrols: 0
    }

    if (session.user.role === 'ADMIN') {
      // Admin can see all stats
      const [totalGuards, activeSites, todayAttendance, lateCheckins, totalPatrols, expectedPatrols] = await Promise.all([
        db.guardProfile.count({
          where: {
            user: { isActive: true }
          }
        }),
        db.site.count({
          where: { isActive: true }
        }),
        db.attendance.count({
          where: {
            timestamp: { gte: today },
            type: 'CHECK_IN'
          }
        }),
        db.attendance.count({
          where: {
            timestamp: { gte: today },
            type: 'CHECK_IN',
            // Late if after 9:00 AM
            OR: [
              { timestamp: { gte: new Date(today.getTime() + 9 * 60 * 60 * 1000) } }
            ]
          }
        }),
        db.patrolScan.count({
          where: {
            timestamp: { gte: today }
          }
        }),
        // Calculate expected patrols (4 per guard per day)
        db.guardProfile.count({
          where: {
            user: { isActive: true }
          }
        }).then(count => count * 4)
      ])

      stats = {
        totalGuards,
        activeSites,
        todayAttendance,
        patrolCompletion: expectedPatrols > 0 ? Math.round((totalPatrols / expectedPatrols) * 100) : 0,
        lateCheckins,
        missedPatrols: Math.max(0, expectedPatrols - totalPatrols)
      }
    } else if (session.user.role === 'SUPERVISOR') {
      // Supervisor can only see stats for their assigned sites
      const supervisorProfile = await db.supervisorProfile.findUnique({
        where: { userId: session.user.id }
      })

      if (!supervisorProfile) {
        return NextResponse.json(
          { error: 'Supervisor profile not found' },
          { status: 404 }
        )
      }

      const [totalGuards, todayAttendance, lateCheckins, totalPatrols, expectedPatrols] = await Promise.all([
        db.guardProfile.count({
          where: {
            assignments: {
              some: {
                site: { supervisorId: supervisorProfile.id },
                isActive: true
              }
            }
          }
        }),
        db.attendance.count({
          where: {
            timestamp: { gte: today },
            type: 'CHECK_IN',
            guard: {
              assignments: {
                some: {
                  site: { supervisorId: supervisorProfile.id },
                  isActive: true
                }
              }
            }
          }
        }),
        db.attendance.count({
          where: {
            timestamp: { gte: today },
            type: 'CHECK_IN',
            guard: {
              assignments: {
                some: {
                  site: { supervisorId: supervisorProfile.id },
                  isActive: true
                }
              }
            },
            OR: [
              { timestamp: { gte: new Date(today.getTime() + 9 * 60 * 60 * 1000) } }
            ]
          }
        }),
        db.patrolScan.count({
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
          }
        }),
        // Calculate expected patrols
        db.guardProfile.count({
          where: {
            assignments: {
              some: {
                site: { supervisorId: supervisorProfile.id },
                isActive: true
              }
            }
          }
        }).then(count => count * 4)
      ])

      stats = {
        totalGuards,
        activeSites: 0, // Supervisors don't need site count
        todayAttendance,
        patrolCompletion: expectedPatrols > 0 ? Math.round((totalPatrols / expectedPatrols) * 100) : 0,
        lateCheckins,
        missedPatrols: Math.max(0, expectedPatrols - totalPatrols)
      }
    } else if (session.user.role === 'CLIENT') {
      // Client can only see stats for their sites
      const clientProfile = await db.clientProfile.findUnique({
        where: { userId: session.user.id }
      })

      if (!clientProfile) {
        return NextResponse.json(
          { error: 'Client profile not found' },
          { status: 404 }
        )
      }

      const [totalGuards, todayAttendance, lateCheckins, totalPatrols, expectedPatrols] = await Promise.all([
        db.guardProfile.count({
          where: {
            assignments: {
              some: {
                site: { clientId: clientProfile.id },
                isActive: true
              }
            }
          }
        }),
        db.attendance.count({
          where: {
            timestamp: { gte: today },
            type: 'CHECK_IN',
            site: { clientId: clientProfile.id }
          }
        }),
        db.attendance.count({
          where: {
            timestamp: { gte: today },
            type: 'CHECK_IN',
            site: { clientId: clientProfile.id },
            OR: [
              { timestamp: { gte: new Date(today.getTime() + 9 * 60 * 60 * 1000) } }
            ]
          }
        }),
        db.patrolScan.count({
          where: {
            timestamp: { gte: today },
            site: { clientId: clientProfile.id }
          }
        }),
        // Calculate expected patrols
        db.guardProfile.count({
          where: {
            assignments: {
              some: {
                site: { clientId: clientProfile.id },
                isActive: true
              }
            }
          }
        }).then(count => count * 4)
      ])

      stats = {
        totalGuards,
        activeSites: 0, // Clients don't need site count
        todayAttendance,
        patrolCompletion: expectedPatrols > 0 ? Math.round((totalPatrols / expectedPatrols) * 100) : 0,
        lateCheckins,
        missedPatrols: Math.max(0, expectedPatrols - totalPatrols)
      }
    } else {
      // Guards can only see their own stats
      const guardProfile = await db.guardProfile.findUnique({
        where: { userId: session.user.id }
      })

      if (!guardProfile) {
        return NextResponse.json(
          { error: 'Guard profile not found' },
          { status: 404 }
        )
      }

      const [todayAttendance, totalPatrols] = await Promise.all([
        db.attendance.count({
          where: {
            guardId: guardProfile.id,
            timestamp: { gte: today },
            type: 'CHECK_IN'
          }
        }),
        db.patrolScan.count({
          where: {
            guardId: guardProfile.id,
            timestamp: { gte: today }
          }
        })
      ])

      stats = {
        totalGuards: 1, // Just themselves
        activeSites: 0,
        todayAttendance,
        patrolCompletion: totalPatrols >= 4 ? 100 : Math.round((totalPatrols / 4) * 100),
        lateCheckins: 0, // Guards don't see their own late status
        missedPatrols: Math.max(0, 4 - totalPatrols)
      }
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}