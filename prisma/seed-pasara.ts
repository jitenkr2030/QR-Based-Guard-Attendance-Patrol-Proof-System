import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create PASARA compliance documents
  console.log('📄 Creating PASARA compliance documents...')
  
  const pasaraLicense = await prisma.complianceDocument.create({
    data: {
      documentType: 'PASARA_LICENSE',
      title: 'PASARA Category-A License',
      description: 'Private Security Agencies Regulation Act 2005 License',
      documentUrl: '/documents/pasara-license.pdf',
      documentNumber: 'PASARA-2024-MH-001',
      issuingAuthority: 'Director General of Police, Maharashtra',
      status: 'ACTIVE',
      uploadedBy: 'admin',
    }
  })

  // Create training records for guards
  console.log('📚 Creating training records...')
  
  const guards = await prisma.guardProfile.findMany({
    include: { user: { select: { name: true } } }
  })

  for (const guard of guards) {
    // Basic Security Training
    await prisma.training.create({
      data: {
        guardId: guard.id,
        type: 'BASIC_SECURITY',
        title: 'Basic Security Training',
        description: '40-hour mandatory basic security training',
        provider: 'Security Training Institute',
        startDate: new Date('2024-01-15'),
        completionDate: new Date('2024-02-15'),
        expiryDate: new Date('2025-02-15'),
        certificateNumber: `BST-${guard.employeeId}-2024`,
        status: 'COMPLETED',
        duration: 40,
        score: 92,
      }
    })

    // Fire Safety Training
    await prisma.training.create({
      data: {
        guardId: guard.id,
        type: 'FIRE_SAFETY',
        title: 'Fire Safety and Emergency Response',
        description: '16-hour fire safety training',
        provider: 'Fire Safety Academy',
        startDate: new Date('2024-03-01'),
        completionDate: new Date('2024-03-17'),
        expiryDate: new Date('2025-03-17'),
        certificateNumber: `FSF-${guard.employeeId}-2024`,
        status: 'COMPLETED',
        duration: 16,
        score: 88,
      }
    })

    // First Aid Training
    await prisma.training.create({
      data: {
        guardId: guard.id,
        type: 'FIRST_AID',
        title: 'First Aid and Medical Emergency',
        description: '24-hour first aid training',
        provider: 'Medical Emergency Response Institute',
        startDate: new Date('2024-04-01'),
        completionDate: new Date('2024-04-25'),
        expiryDate: new Date('2025-04-25'),
        certificateNumber: `FA-${guard.employeeId}-2024`,
        status: 'COMPLETED',
        duration: 24,
        score: 95,
      }
    })
  }

  // Create sample incidents
  console.log('🚨 Creating sample incidents...')
  
  const sites = await prisma.site.findMany()
  const activeGuards = guards.filter(g => g.user.isActive)

  if (sites.length > 0 && activeGuards.length > 0) {
    // Sample incident 1
    await prisma.incident.create({
      data: {
        incidentNumber: 'INC-2024-001',
        title: 'Unauthorized Access Attempt',
        description: 'Unknown individual attempted to access restricted area after hours',
        severity: 'HIGH',
        type: 'SECURITY_BREACH',
        incidentDate: new Date('2024-12-01T22:30:00Z'),
        reportedDate: new Date('2024-12-01T22:35:00Z'),
        resolvedDate: new Date('2024-12-02T01:15:00Z'),
        status: 'RESOLVED',
        guardId: activeGuards[0].id,
        siteId: sites[0].id,
        actions: JSON.stringify([
          'Area secured immediately',
          'Management notified via phone',
          'Police informed and report filed',
          'Additional patrols deployed'
        ]),
        resolution: 'Individual was identified as former employee. Security measures were reinforced and access protocols updated.',
      }
    })

    // Sample incident 2
    await prisma.incident.create({
      data: {
        incidentNumber: 'INC-2024-002',
        title: 'CCTV Camera Malfunction',
        description: 'Main entrance CCTV camera stopped functioning during night shift',
        severity: 'MEDIUM',
        type: 'EQUIPMENT',
        incidentDate: new Date('2024-12-05T18:45:00Z'),
        reportedDate: new Date('2024-12-05T19:00:00Z'),
        resolvedDate: new Date('2024-12-06T10:30:00Z'),
        status: 'RESOLVED',
        guardId: activeGuards[1].id,
        siteId: sites[1].id,
        actions: JSON.stringify([
          'Temporary camera installed',
          'Maintenance team notified immediately',
          'Backup camera coverage activated',
          'Client informed of temporary coverage gap'
        ]),
        resolution: 'Camera was repaired and fully restored to functionality. Backup camera ensured continuous coverage during repair period.',
      }
    })

    // Sample incident 3
    await prisma.incident.create({
      data: {
        incidentNumber: 'INC-2024-003',
        title: 'Medical Emergency',
        description: 'Visitor experienced chest pain and required medical attention',
        severity: 'HIGH',
        type: 'MEDICAL',
        incidentDate: new Date('2024-12-10T14:20:00Z'),
        reportedDate: new Date('2024-12-10T14:25:00Z'),
        resolvedDate: new Date('2024-12-10T15:45:00Z'),
        status: 'RESOLVED',
        guardId: activeGuards[2].id,
        siteId: sites[0].id,
        actions: JSON.stringify([
          'First aid administered immediately',
          'Emergency services called (108)',
          'Visitor vitals monitored',
          'Family members contacted',
          'Access provided to emergency medical team'
        ]),
        resolution: 'Visitor received prompt medical attention and was transported to hospital. Condition reported as stable. Family expressed gratitude for quick response.',
      }
    })
  }

  // Create PASARA audit record
  console.log('🔍 Creating PASARA audit record...')
  
  await prisma.pASARAAudit.create({
    data: {
      auditDate: new Date('2024-11-15'),
      auditorName: 'Rajesh Kumar',
      auditorAgency: 'State Security Audit Bureau',
      licenseNumber: 'PASARA-2024-MH-001',
      overallScore: 94,
      complianceStatus: 'COMPLIANT',
      violations: 0,
      nextAuditDate: new Date('2025-11-15'),
    }
  })

  // Create guard verification documents
  console.log('👮 Creating guard verification documents...')
  
  for (const guard of guards) {
    // Police verification
    await prisma.complianceDocument.create({
      data: {
        documentType: 'POLICE_VERIFICATION',
        title: `Police Verification - ${guard.user.name}`,
        description: `Police verification certificate for ${guard.user.name}`,
        documentUrl: `/documents/police-verification-${guard.id}.pdf`,
        documentNumber: `PV-${guard.employeeId}-2024`,
        issuingAuthority: 'Local Police Station',
        status: 'ACTIVE',
        guardId: guard.id,
        uploadedBy: 'admin',
        verifiedAt: new Date('2024-01-10'),
        verifiedBy: 'admin',
      }
    })

    // Background verification
    await prisma.complianceDocument.create({
      data: {
        documentType: 'BACKGROUND_CHECK',
        title: `Background Check - ${guard.user.name}`,
        description: `Comprehensive background verification for ${guard.user.name}`,
        documentUrl: `/documents/background-check-${guard.id}.pdf`,
        documentNumber: `BC-${guard.employeeId}-2024`,
        issuingAuthority: 'Background Verification Agency',
        status: 'ACTIVE',
        guardId: guard.id,
        uploadedBy: 'admin',
        verifiedAt: new Date('2024-01-05'),
        verifiedBy: 'admin',
      }
    })
  }

  // Create site compliance documents
  console.log('🏢 Creating site compliance documents...')
  
  for (const site of sites) {
    // Site agreement
    await prisma.complianceDocument.create({
      data: {
        documentType: 'SITE_AGREEMENT',
        title: `Site Security Agreement - ${site.name}`,
        description: `Security service agreement for ${site.name}`,
        documentUrl: `/documents/site-agreement-${site.id}.pdf`,
        documentNumber: `SA-${site.id}-2024`,
        issuingAuthority: 'Security Agency Management',
        status: 'ACTIVE',
        siteId: site.id,
        uploadedBy: 'admin',
        verifiedAt: new Date('2024-01-15'),
        verifiedBy: 'admin',
      }
    })

    // Insurance policy
    await prisma.complianceDocument.create({
      data: {
        documentType: 'INSURANCE_POLICY',
        title: `Liability Insurance - ${site.name}`,
        description: `Comprehensive liability insurance coverage for ${site.name}`,
        documentUrl: `/documents/insurance-${site.id}.pdf`,
        documentNumber: `INS-${site.id}-2024`,
        issuingAuthority: 'National Insurance Company',
        status: 'ACTIVE',
        expiryDate: new Date('2025-01-31'),
        siteId: site.id,
        uploadedBy: 'admin',
        verifiedAt: new Date('2024-01-20'),
        verifiedBy: 'admin',
      }
    })
  }

  // Create system settings for PASARA
  console.log('⚙️ Creating PASARA system settings...')
  
  const pasaraSettings = [
    {
      key: 'PASARA_LICENSE_NUMBER',
      value: 'PASARA-2024-MH-001',
      description: 'PASARA license number for the security agency'
    },
    {
      key: 'PASARA_LICENSE_TYPE',
      value: 'Category-A',
      description: 'PASARA license category'
    },
    {
      key: 'PASARA_LICENSE_EXPIRY',
      value: '2025-12-31',
      description: 'PASARA license expiry date'
    },
    {
      key: 'PASARA_AUDIT_AGENCY',
      value: 'State Security Audit Bureau',
      description: 'Authorized PASARA audit agency'
    },
    {
      key: 'PASARA_LAST_AUDIT',
      value: '2024-11-15',
      description: 'Date of last PASARA audit'
    },
    {
      key: 'PASARA_NEXT_AUDIT',
      value: '2025-11-15',
      description: 'Date of next scheduled PASARA audit'
    },
    {
      key: 'PASARA_COMPLIANCE_SCORE',
      value: '94',
      description: 'Current PASARA compliance score'
    }
  ]

  for (const setting of pasaraSettings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value, description: setting.description },
      create: { ...setting }
    })
  }

  console.log('✅ Database seeding completed successfully!')
  console.log('')
  console.log('📊 PASARA Compliance Summary:')
  console.log(`   - PASARA License: ${pasaraSettings.find(s => s.key === 'PASARA_LICENSE_NUMBER')?.value}`)
  console.log(`   - Compliance Score: ${pasaraSettings.find(s => s.key === 'PASARA_COMPLIANCE_SCORE')?.value}%`)
  console.log(`   - Last Audit: ${pasaraSettings.find(s => s.key === 'PASARA_LAST_AUDIT')?.value}`)
  console.log(`   - Next Audit: ${pasaraSettings.find(s => s.key === 'PASARA_NEXT_AUDIT')?.value}`)
  console.log(`   - Training Records: Created ${guards.length * 3} training records`)
  console.log(`   - Incident Reports: Created 3 sample incidents`)
  console.log(`   - Guard Verifications: Created ${guards.length * 2} verification documents`)
  console.log(`   - Site Documents: Created ${sites.length * 2} site compliance documents`)
  console.log('')
  console.log('🎯 PASARA Compliance Features Ready:')
  console.log('   ✓ Guard verification tracking')
  console.log('   ✓ Police verification records')
  console.log('   ✓ Training completion monitoring')
  console.log('   ✓ Incident management system')
  console.log('   ✓ Compliance document management')
  console.log('   ✓ Automated report generation')
  console.log('   ✓ Audit preparation tools')
  console.log('   ✓ Real-time compliance monitoring')
  console.log('')
  console.log('🔗 Access PASARA Compliance at: /pasara-compliance')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })