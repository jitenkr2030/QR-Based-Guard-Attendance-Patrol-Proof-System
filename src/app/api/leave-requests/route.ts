import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { LeaveStatus } from '@prisma/client'

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
    const status = searchParams.get('status') as LeaveStatus
    const guardId = searchParams.get('guardId')

    let leaveRequests

    if (session.user.role === 'GUARD') {
      // Guards can only see their own leave requests
      const guardProfile = await db.guardProfile.findUnique({
        where: { userId: session.user.id }
      })

      if (!guardProfile) {
        return NextResponse.json(
          { error: 'Guard profile not found' },
          { status: 404 }
        )
      }

      leaveRequests = await db.leaveRequest.findMany({
        where: {
          guardId: guardProfile.id,
          ...(status && { status })
        },
        include: {
          guard: {
            include: {
              user: {
                select: { name: true, email: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    } else if (session.user.role === 'SUPERVISOR') {
      // Supervisors can see leave requests for guards at their assigned sites
      const supervisorProfile = await db.supervisorProfile.findUnique({
        where: { userId: session.user.id }
      })

      if (!supervisorProfile) {
        return NextResponse.json(
          { error: 'Supervisor profile not found' },
          { status: 404 }
        )
      }

      leaveRequests = await db.leaveRequest.findMany({
        where: {
          guard: {
            assignments: {
              some: {
                site: {
                  supervisorId: supervisorProfile.id
                },
                isActive: true
              }
            }
          },
          ...(status && { status }),
          ...(guardId && { guardId })
        },
        include: {
          guard: {
            include: {
              user: {
                select: { name: true, email: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    } else {
      // Admins can see all leave requests
      leaveRequests = await db.leaveRequest.findMany({
        where: {
          ...(status && { status }),
          ...(guardId && { guardId })
        },
        include: {
          guard: {
            include: {
              user: {
                select: { name: true, email: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    }

    return NextResponse.json(leaveRequests)
  } catch (error) {
    console.error('Leave requests fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'GUARD') {
      return NextResponse.json(
        { error: 'Only guards can submit leave requests' },
        { status: 403 }
      )
    }

    const { startDate, endDate, reason } = await request.json()

    if (!startDate || !endDate || !reason) {
      return NextResponse.json(
        { error: 'Start date, end date, and reason are required' },
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

    // Create leave request
    const leaveRequest = await db.leaveRequest.create({
      data: {
        guardId: guardProfile.id,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason
      },
      include: {
        guard: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        }
      }
    })

    return NextResponse.json(leaveRequest, { status: 201 })
  } catch (error) {
    console.error('Leave request creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}