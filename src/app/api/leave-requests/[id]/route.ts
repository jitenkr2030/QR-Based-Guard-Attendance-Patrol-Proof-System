import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { LeaveStatus } from '@prisma/client'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!['SUPERVISOR', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Only supervisors and admins can approve leave requests' },
        { status: 403 }
      )
    }

    const { status, rejectReason } = await request.json()

    if (!Object.values(LeaveStatus).includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    const leaveRequest = await db.leaveRequest.findUnique({
      where: { id: params.id },
      include: {
        guard: {
          include: {
            user: { select: { name: true, email: true } }
          }
        }
      }
    })

    if (!leaveRequest) {
      return NextResponse.json(
        { error: 'Leave request not found' },
        { status: 404 }
      )
    }

    // Check if supervisor can approve this leave request
    if (session.user.role === 'SUPERVISOR') {
      const supervisorProfile = await db.supervisorProfile.findUnique({
        where: { userId: session.user.id }
      })

      if (!supervisorProfile) {
        return NextResponse.json(
          { error: 'Supervisor profile not found' },
          { status: 404 }
        )
      }

      const canApprove = await db.siteAssignment.findFirst({
        where: {
          guardId: leaveRequest.guardId,
          site: {
            supervisorId: supervisorProfile.id
          },
          isActive: true
        }
      })

      if (!canApprove) {
        return NextResponse.json(
          { error: 'You can only approve leave requests for guards at your assigned sites' },
          { status: 403 }
        )
      }
    }

    const updatedRequest = await db.leaveRequest.update({
      where: { id: params.id },
      data: {
        status,
        approvedBy: session.user.id,
        approvedAt: status === LeaveStatus.APPROVED ? new Date() : null,
        rejectReason: status === LeaveStatus.REJECTED ? rejectReason : null
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

    return NextResponse.json(updatedRequest)
  } catch (error) {
    console.error('Leave request approval error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}