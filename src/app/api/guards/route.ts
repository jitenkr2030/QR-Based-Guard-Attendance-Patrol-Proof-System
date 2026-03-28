import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

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
    const siteId = searchParams.get('siteId')
    const isActive = searchParams.get('isActive') === 'true' ? true : searchParams.get('isActive') === 'false' ? false : undefined

    let guards

    if (session.user.role === 'GUARD') {
      // Guards can only see their own profile
      const guardProfile = await db.guardProfile.findUnique({
        where: { userId: session.user.id },
        include: {
          user: {
            select: { name: true, email: true, phone: true, isActive: true }
          },
          assignments: {
            include: {
              site: {
                select: { name: true, address: true }
              }
            },
            where: { isActive: true }
          },
          _count: {
            select: {
              attendances: true,
              patrols: true
            }
          }
        }
      })

      if (!guardProfile) {
        return NextResponse.json(
          { error: 'Guard profile not found' },
          { status: 404 }
        )
      }

      guards = [guardProfile]
    } else if (session.user.role === 'SUPERVISOR') {
      // Supervisors can see guards at their assigned sites
      const supervisorProfile = await db.supervisorProfile.findUnique({
        where: { userId: session.user.id }
      })

      if (!supervisorProfile) {
        return NextResponse.json(
          { error: 'Supervisor profile not found' },
          { status: 404 }
        )
      }

      guards = await db.guardProfile.findMany({
        where: {
          assignments: {
            some: {
              site: {
                supervisorId: supervisorProfile.id
              },
              isActive: true
            }
          }
        },
        include: {
          user: {
            select: { name: true, email: true, phone: true, isActive: true }
          },
          assignments: {
            include: {
              site: {
                select: { name: true, address: true }
              }
            },
            where: { 
              isActive: true,
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
    } else {
      // Admins can see all guards
      guards = await db.guardProfile.findMany({
        where: {
          user: {
            ...(isActive !== undefined && { isActive })
          }
        },
        include: {
          user: {
            select: { name: true, email: true, phone: true, isActive: true }
          },
          assignments: {
            include: {
              site: {
                select: { name: true, address: true }
              }
            },
            where: { 
              isActive: true,
              ...(siteId && { siteId })
            }
          },
          _count: {
            select: {
              attendances: true,
              patrols: true
            }
          }
        },
        orderBy: {
          user: { name: 'asc' }
        }
      })
    }

    return NextResponse.json(guards)
  } catch (error) {
    console.error('Guards fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || !['ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { 
      name, 
      email, 
      password, 
      phone, 
      employeeId, 
      department, 
      hireDate, 
      salary,
      siteIds 
    } = await request.json()

    if (!name || !email || !password || !employeeId) {
      return NextResponse.json(
        { error: 'Name, email, password, and employee ID are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Check if employee ID already exists
    const existingGuard = await db.guardProfile.findUnique({
      where: { employeeId }
    })

    if (existingGuard) {
      return NextResponse.json(
        { error: 'Employee ID already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user and guard profile in a transaction
    const result = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          phone,
          role: 'GUARD'
        }
      })

      const guardProfile = await tx.guardProfile.create({
        data: {
          userId: user.id,
          employeeId,
          department,
          hireDate: hireDate ? new Date(hireDate) : null,
          salary: salary ? parseFloat(salary) : null
        },
        include: {
          user: {
            select: { name: true, email: true, phone: true, isActive: true }
          }
        }
      })

      // Assign to sites if provided
      if (siteIds && siteIds.length > 0) {
        for (const siteId of siteIds) {
          await tx.siteAssignment.create({
            data: {
              guardId: guardProfile.id,
              siteId,
              startDate: new Date(),
              isActive: true
            }
          })
        }
      }

      return guardProfile
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Guard creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}