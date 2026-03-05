import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@guardsecurity.com' },
    update: {},
    create: {
      email: 'admin@guardsecurity.com',
      password: adminPassword,
      name: 'System Administrator',
      role: 'ADMIN',
      phone: '+1234567890'
    }
  })

  const adminProfile = await prisma.adminProfile.create({
    data: {
      userId: admin.id,
      employeeId: 'ADMIN001',
      permissions: JSON.stringify(['all'])
    }
  })

  // Create client user
  const clientPassword = await bcrypt.hash('client123', 12)
  const client = await prisma.user.upsert({
    where: { email: 'client@company.com' },
    update: {},
    create: {
      email: 'client@company.com',
      password: clientPassword,
      name: 'John Client',
      role: 'CLIENT',
      phone: '+1234567891'
    }
  })

  const clientProfile = await prisma.clientProfile.create({
    data: {
      userId: client.id,
      companyName: 'ABC Corporation',
      contactPerson: 'John Client',
      billingAddress: '123 Business St, City, State 12345'
    }
  })

  // Create supervisor user
  const supervisorPassword = await bcrypt.hash('supervisor123', 12)
  const supervisor = await prisma.user.upsert({
    where: { email: 'supervisor@guardsecurity.com' },
    update: {},
    create: {
      email: 'supervisor@guardsecurity.com',
      password: supervisorPassword,
      name: 'Jane Supervisor',
      role: 'SUPERVISOR',
      phone: '+1234567892'
    }
  })

  const supervisorProfile = await prisma.supervisorProfile.create({
    data: {
      userId: supervisor.id,
      employeeId: 'SUP001',
      department: 'Operations'
    }
  })

  // Create guard users
  const guardData = [
    { name: 'Mike Guard', email: 'mike@guardsecurity.com', employeeId: 'GUARD001' },
    { name: 'Sarah Guard', email: 'sarah@guardsecurity.com', employeeId: 'GUARD002' },
    { name: 'Tom Guard', email: 'tom@guardsecurity.com', employeeId: 'GUARD003' }
  ]

  const guardProfiles = []
  for (const guard of guardData) {
    const guardPassword = await bcrypt.hash('guard123', 12)
    const guardUser = await prisma.user.upsert({
      where: { email: guard.email },
      update: {},
      create: {
        email: guard.email,
        password: guardPassword,
        name: guard.name,
        role: 'GUARD',
        phone: '+1234567893'
      }
    })

    const guardProfile = await prisma.guardProfile.create({
      data: {
        userId: guardUser.id,
        employeeId: guard.employeeId,
        department: 'Security',
        hireDate: new Date('2023-01-15'),
        salary: 35000
      }
    })

    guardProfiles.push(guardProfile)
  }

  // Create sites
  const sites = await Promise.all([
    prisma.site.create({
      data: {
        name: 'ABC Corporate Office',
        address: '123 Business Ave, Downtown, City 12345',
        description: 'Main corporate headquarters with 24/7 security',
        clientId: clientProfile.id,
        supervisorId: supervisorProfile.id
      }
    }),
    prisma.site.create({
      data: {
        name: 'ABC Warehouse Facility',
        address: '456 Industrial Park, City 67890',
        description: 'Large warehouse facility requiring regular patrols',
        clientId: clientProfile.id,
        supervisorId: supervisorProfile.id
      }
    })
  ])

  // Create QR codes for each site
  for (const site of sites) {
    // Attendance QR code
    await prisma.qRCode.create({
      data: {
        code: `attendance-${site.id}-${Date.now()}`,
        type: 'ATTENDANCE',
        name: `${site.name} - Attendance`,
        description: 'Main entrance attendance QR code',
        siteId: site.id,
        location: 'Main Entrance'
      }
    })

    // Patrol point QR codes
    const patrolPoints = ['Main Gate', 'Back Gate', 'Parking Area', 'Loading Dock']
    for (const point of patrolPoints) {
      await prisma.qRCode.create({
        data: {
          code: `patrol-${site.id}-${point.toLowerCase().replace(' ', '-')}-${Date.now()}`,
          type: 'PATROL_POINT',
          name: `${site.name} - ${point}`,
          description: `Patrol checkpoint at ${point}`,
          siteId: site.id,
          location: point
        }
      })
    }
  }

  // Assign guards to sites
  for (let i = 0; i < guardProfiles.length; i++) {
    await prisma.siteAssignment.create({
      data: {
        guardId: guardProfiles[i].id,
        siteId: sites[i % sites.length].id,
        startDate: new Date('2024-01-01'),
        isActive: true
      }
    })
  }

  // Create sample attendance records
  const today = new Date()
  today.setHours(8, 0, 0, 0) // 8:00 AM

  for (const guardProfile of guardProfiles) {
    // Check-in record
    await prisma.attendance.create({
      data: {
        guardId: guardProfile.id,
        siteId: sites[0].id,
        qrCodeId: (await prisma.qRCode.findFirst({ 
          where: { siteId: sites[0].id, type: 'ATTENDANCE' }
        }))!.id,
        type: 'CHECK_IN',
        timestamp: today,
        location: 'Main Entrance',
        ipAddress: '192.168.1.100',
        userAgent: 'Mobile App'
      }
    })
  }

  // Create sample patrol records
  const patrolTime = new Date()
  patrolTime.setHours(10, 0, 0, 0) // 10:00 AM

  for (let i = 0; i < 2; i++) {
    const patrolQRs = await prisma.qRCode.findMany({
      where: { siteId: sites[0].id, type: 'PATROL_POINT' },
      take: 3
    })

    for (let j = 0; j < patrolQRs.length; j++) {
      await prisma.patrolScan.create({
        data: {
          guardId: guardProfiles[0].id,
          siteId: sites[0].id,
          qrCodeId: patrolQRs[j].id,
          sequence: j + 1,
          timestamp: new Date(patrolTime.getTime() + j * 30 * 60 * 1000), // 30 minutes apart
          location: patrolQRs[j].location,
          ipAddress: '192.168.1.100',
          userAgent: 'Mobile App'
        }
      })
    }
  }

  console.log('✅ Database seeded successfully!')
  console.log('\n🔐 Login Credentials:')
  console.log('Admin: admin@guardsecurity.com / admin123')
  console.log('Client: client@company.com / client123')
  console.log('Supervisor: supervisor@guardsecurity.com / supervisor123')
  console.log('Guard: mike@guardsecurity.com / guard123')
  console.log('Guard: sarah@guardsecurity.com / guard123')
  console.log('Guard: tom@guardsecurity.com / guard123')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })