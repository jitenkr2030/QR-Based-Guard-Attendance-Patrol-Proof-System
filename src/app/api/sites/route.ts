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

    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')

    let sites

    if (session.user.role === 'CLIENT') {
      // Clients can only see their own sites
      const clientProfile = await db.clientProfile.findUnique({
        where: { userId: session.user.id }
      })

      if (!clientProfile) {
        return NextResponse.json(
          { error: 'Client profile not found' },
          { status: 404 }
        )
      }

      sites = await db.site.findMany({
        where: { clientId: clientProfile.id },
        include: {
          client: {
            select: { companyName: true }
          },
          supervisor: {
            include: {
              user: {
                select: { name: true, email: true }
              }
            }
          },
          _count: {
            select: {
              qrCodes: true,
              assignments: true,
              attendances: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    } else if (session.user.role === 'SUPERVISOR') {
      // Supervisors can only see their assigned sites
      const supervisorProfile = await db.supervisorProfile.findUnique({
        where: { userId: session.user.id }
      })

      if (!supervisorProfile) {
        return NextResponse.json(
          { error: 'Supervisor profile not found' },
          { status: 404 }
        )
      }

      sites = await db.site.findMany({
        where: { supervisorId: supervisorProfile.id },
        include: {
          client: {
            select: { companyName: true }
          },
          supervisor: {
            include: {
              user: {
                select: { name: true, email: true }
              }
            }
          },
          _count: {
            select: {
              qrCodes: true,
              assignments: true,
              attendances: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    } else {
      // Admins can see all sites
      sites = await db.site.findMany({
        where: clientId ? clientId : undefined,
        include: {
          client: {
            select: { companyName: true }
          },
          supervisor: {
            include: {
              user: {
                select: { name: true, email: true }
              }
            }
          },
          _count: {
            select: {
              qrCodes: true,
              assignments: true,
              attendances: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    }

    return NextResponse.json(sites)
  } catch (error) {
    console.error('Sites fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || !['ADMIN', 'CLIENT'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { name, address, description, clientId, supervisorId } = await request.json()

    let finalClientId = clientId

    // If client is creating the site, use their own client ID
    if (session.user.role === 'CLIENT') {
      const clientProfile = await db.clientProfile.findUnique({
        where: { userId: session.user.id }
      })

      if (!clientProfile) {
        return NextResponse.json(
          { error: 'Client profile not found' },
          { status: 404 }
        )
      }

      finalClientId = clientProfile.id
    }

    const site = await db.site.create({
      data: {
        name,
        address,
        description,
        clientId: finalClientId,
        supervisorId
      },
      include: {
        client: {
          select: { companyName: true }
        },
        supervisor: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        }
      }
    })

    return NextResponse.json(site, { status: 201 })
  } catch (error) {
    console.error('Site creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}