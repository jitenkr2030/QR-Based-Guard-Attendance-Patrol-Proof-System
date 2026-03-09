import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'
import { db } from '@/lib/db'
import { QRCodeType } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const { siteId, type, name, description, location } = await request.json()

    // Validate site exists
    const site = await db.site.findUnique({
      where: { id: siteId }
    })

    if (!site) {
      return NextResponse.json(
        { error: 'Site not found' },
        { status: 404 }
      )
    }

    // Generate unique QR code
    const code = uuidv4()
    
    // Create QR code data
    const qrData = JSON.stringify({
      code,
      type,
      siteId,
      timestamp: new Date().toISOString()
    })

    // Generate QR code image
    const qrCodeImage = await QRCode.toDataURL(qrData)

    // Save to database
    const qrCode = await db.qRCode.create({
      data: {
        code,
        type: type || QRCodeType.ATTENDANCE,
        name,
        description,
        siteId,
        location
      }
    })

    return NextResponse.json({
      ...qrCode,
      qrImage: qrCodeImage
    })
  } catch (error) {
    console.error('QR code generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const siteId = searchParams.get('siteId')

    if (!siteId) {
      return NextResponse.json(
        { error: 'Site ID is required' },
        { status: 400 }
      )
    }

    const qrCodes = await db.qRCode.findMany({
      where: { siteId },
      include: {
        site: {
          select: { name: true, address: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(qrCodes)
  } catch (error) {
    console.error('QR codes fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}